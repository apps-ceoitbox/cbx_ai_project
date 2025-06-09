// This service extracts and parses VTT files from Zoom recording links

export interface Caption {
  start: string;
  end: string;
  text: string;
}

/**
 * Alternative method to construct VTT URL using the format from the HTML file
 * This might work when other methods fail
 */
export function constructAlternativeVttUrl(zoomUrl: string): string | null {
  try {
    // Extract the meeting ID and access token from the URL
    let meetingId = '';
    let accessToken = '';
    
    // Parse the URL
    const url = new URL(zoomUrl);
    const pathParts = url.pathname.split('/');
    
    // The last part of the path should contain the meeting ID
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      
      // Check if the meeting ID contains the access token
      if (lastPart.includes('.')) {
        const parts = lastPart.split('.');
        meetingId = parts[0];
        accessToken = parts[1];
      } else {
        meetingId = lastPart;
      }
    }
    
    // Look for access token in the query parameters if not found yet
    if (!accessToken) {
      const searchParams = new URLSearchParams(url.search);
      for (const [key, value] of searchParams.entries()) {
        if (key === 'token' || key === 'access_token') {
          accessToken = value;
        }
      }
    }
    
    if (!meetingId) {
      console.error("Could not extract meeting ID from URL");
      return null;
    }
    
    // Base VTT URL
    const baseVttUrl = "https://zoom.us/rec/play/vtt";
    
    // Create VTT URL with the HTML file's format
    // Note: the difference is how we combine meetingID and accessToken
    const vttUrl = `${baseVttUrl}?type=transcript&fid=${meetingId}${accessToken ? '.' + accessToken : ''}&action=play`;
    
    console.log("Created alternative VTT URL:", vttUrl);
    return vttUrl;
  } catch (error) {
    console.error("Error creating alternative VTT URL:", error);
    return null;
  }
}

/**
 * Extracts the VTT file URL from a Zoom recording page
 */
export async function extractVttUrlFromZoomRecording(zoomUrl: string): Promise<string | null> {
  try {
    if (!zoomUrl || !zoomUrl.includes("zoom.us")) {
      throw new Error("Invalid Zoom URL");
    }
    
    console.log("Attempting to extract VTT from:", zoomUrl);
    
    // Try the alternative method first (based on HTML file approach)
    const alternativeUrl = constructAlternativeVttUrl(zoomUrl);
    if (alternativeUrl) {
      console.log("Generated alternative URL:", alternativeUrl);
      return alternativeUrl;
    }
    
    // Parse the URL
    const url = new URL(zoomUrl);
    const pathParts = url.pathname.split('/');
    
    // Extract meeting ID and access token
    let meetingId = "";
    let accessToken = "";
    
    // Find the meeting ID in path
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === "play" && i + 1 < pathParts.length) {
        meetingId = pathParts[i + 1];
        break;
      }
    }
    
    // If no meeting ID found yet, try the last part of the path
    if (!meetingId && pathParts.length > 0) {
      meetingId = pathParts[pathParts.length - 1];
    }
    
    console.log("Raw extracted ID:", meetingId);
    
    // Get token from query params
    const searchParams = new URLSearchParams(url.search);
    for (const [key, value] of searchParams.entries()) {
      if (key === 'token' || key === 'access_token') {
        accessToken = value;
      }
    }
    
    // If token not in query, check if it's part of meeting ID
    if (!accessToken && meetingId && meetingId.includes('.')) {
      const parts = meetingId.split('.');
      meetingId = parts[0];
      accessToken = parts[1];
      console.log("Extracted access token from URL:", accessToken);
    }
    
    if (!meetingId) {
      throw new Error("Could not extract file ID from URL");
    }
    
    console.log("Using meeting ID:", meetingId);
    
    // Construct the VTT URL using the format from the working HTML example
    // Use the format where accessToken is appended to meetingId with a dot
    let vttUrl = "";
    
    if (accessToken) {
      // Use the combined format (meetingID.accessToken)
      vttUrl = `https://zoom.us/rec/play/vtt?type=transcript&fid=${meetingId}.${accessToken}&action=play`;
    } else {
      // Fallback to the original format
      vttUrl = `https://zoom.us/rec/play/vtt?type=transcript&fid=${meetingId}&action=play`;
    }
    
    console.log("Created VTT URL:", vttUrl);
    return vttUrl;
  } catch (error) {
    console.error("Error extracting VTT URL:", error);
    throw new Error(`Could not extract VTT file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract file ID from Zoom URL - legacy method, kept for reference
 */
function extractFileId(zoomUrl: string): string | null {
  // For URLs like https://zoom.us/rec/play/8H5sMkFzJdZ-YiaUoA-X32K-0P9nNjy41-CHuCQoLB2Puek90BvupN2woEEb68WTUDms84ZpCFSOzAs.Q7lzXVXz0ENW5wqT
  // We need to extract the file ID which is everything after "play/" and possibly before a period
  
  // First, check if the URL contains the standard format
  const standardMatch = zoomUrl.match(/zoom\.us\/rec\/play\/([A-Za-z0-9_\-]+(?:\.[A-Za-z0-9_\-]+)?)/);
  
  if (standardMatch && standardMatch[1]) {
    return standardMatch[1];
  }
  
  // Alternative format: try to extract the file ID from anywhere in the URL
  const fallbackMatch = zoomUrl.match(/([A-Za-z0-9_\-]{20,})/);
  
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }
  
  return null;
}

/**
 * Fetches and parses a VTT file into usable text content
 */
export async function parseVttFile(vttUrl: string): Promise<string> {
  try {
    console.log("Fetching VTT file from:", vttUrl);
    
    // Method similar to the HTML file which successfully extracts VTT
    // Try direct fetch first, then fallback to proxies
    let vttContent = null;
    let lastError = null;
    let proxyDetailsForDebug = [];
    
    // First attempt: direct fetch
    try {
      console.log("Trying direct fetch first");
      const directResponse = await fetch(vttUrl, {
        headers: {
          'Accept': 'text/vtt,text/plain,*/*',
          'Content-Type': 'text/plain',
        },
        cache: 'no-cache',
      });
      
      if (directResponse.ok) {
        vttContent = await directResponse.text();
        console.log("Direct fetch successful, VTT content sample:", vttContent.substring(0, 200));
        
        // Check if the content is actually a VTT file
        if (vttContent.includes("WEBVTT") || vttContent.trim().startsWith("WEBVTT")) {
          // Found valid VTT content
          return parseVttContent(vttContent);
        } else {
          console.warn("Direct response doesn't look like VTT, will try proxies");
        }
      }
    } catch (err) {
      console.warn("Direct fetch failed, will try proxies:", err);
      lastError = err;
    }
    
    // Fallback to CORS proxies
    const corsProxies = [
      `https://corsproxy.io/?${encodeURIComponent(vttUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(vttUrl)}`,
      `https://proxy.cors.sh/${vttUrl}`,
      `https://corsproxy.org/?${encodeURIComponent(vttUrl)}`,
      // Add more reliable modern proxies
      `https://cors-anywhere.herokuapp.com/${vttUrl}`,
      `https://thingproxy.freeboard.io/fetch/${vttUrl}`,
      `https://api.codetabs.com/v1/proxy/?quest=${vttUrl}`,
      `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(vttUrl)}`
    ];
    
    // Try each proxy until one works
    for (const proxyUrl of corsProxies) {
      try {
        console.log("Trying CORS proxy:", proxyUrl);
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'text/vtt,text/plain,*/*',
            'Origin': window.location.origin
          },
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          const statusInfo = `${response.status} ${response.statusText}`;
          console.warn(`Proxy ${proxyUrl} failed with status ${statusInfo}`);
          proxyDetailsForDebug.push(`${proxyUrl.substring(0, 30)}... - ${statusInfo}`);
          continue;
        }
        
        vttContent = await response.text();
        console.log("VTT content sample:", vttContent.substring(0, 200));
        
        // Check if the content is actually a VTT file
        if (vttContent.includes("WEBVTT") || vttContent.trim().startsWith("WEBVTT")) {
          break; // Found valid VTT content, exit the loop
        } else {
          console.warn("Response doesn't look like VTT, trying next proxy");
          proxyDetailsForDebug.push(`${proxyUrl.substring(0, 30)}... - Invalid content type`);
        }
      } catch (err) {
        console.warn(`Proxy ${proxyUrl} failed with error:`, err);
        proxyDetailsForDebug.push(`${proxyUrl.substring(0, 30)}... - ${err instanceof Error ? err.message : "Unknown error"}`);
        lastError = err;
      }
    }
    
    if (!vttContent) {
      const detailedError = new Error(`All fetch methods failed. Details: ${proxyDetailsForDebug.join(" | ")}`);
      console.error(detailedError);
      throw lastError || detailedError;
    }
    
    // Check if the content is actually a VTT file
    if (!vttContent.includes("WEBVTT") && !vttContent.trim().startsWith("WEBVTT")) {
      console.error("Invalid VTT content:", vttContent.substring(0, 100) + "...");
      
      if (vttContent.includes("<html") || vttContent.includes("<!DOCTYPE")) {
        // This is an HTML response, not a VTT file
        throw new Error("No VTT file found on the Zoom recording page");
      }
    }
    
    // Parse VTT content to extract captions
    return parseVttContent(vttContent);
    
  } catch (error) {
    console.error("Error parsing VTT file:", error);
    throw new Error(`Could not parse VTT file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse VTT content to extract captions
 */
export function parseVttContent(vttContent: string): string {
  try {
    const captions = parseVttToCaption(vttContent);
    // Convert captions to transcript text
    return convertCaptionsToTranscript(captions);
  } catch (error) {
    console.error("Error parsing VTT content:", error);
    throw new Error(`Could not parse VTT content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse VTT content to extract captions
 */
function parseVttToCaption(vttContent: string): Caption[] {
  const lines = vttContent.split('\n');
  const captions: Caption[] = [];
  let currentCaption: Partial<Caption> = {};
  
  // Skip the WEBVTT header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      continue;
    }
    
    // Check if this line contains timing information
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map(time => time.trim());
      currentCaption = { start, end };
    } 
    // If not a timestamp and we have a current caption, it's the text
    else if (currentCaption.start && currentCaption.end) {
      if (!currentCaption.text) {
        currentCaption.text = line;
      } else {
        currentCaption.text += ' ' + line;
      }
      
      // If the next line is empty or a new timestamp, save this caption
      if (i + 1 >= lines.length || lines[i + 1].trim() === '' || lines[i + 1].includes('-->')) {
        captions.push(currentCaption as Caption);
        currentCaption = {};
      }
    }
  }
  
  return captions;
}

/**
 * Convert array of captions to readable transcript text
 */
function convertCaptionsToTranscript(captions: Caption[]): string {
  // Join caption texts to form a transcript
  return captions.map(caption => caption.text).join(' ')
    // Clean up the transcript
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Direct method to fetch VTT content from Zoom - similar to HTML file approach
 * This is an alternative to the other approaches
 */
export async function directZoomVttFetch(zoomUrl: string): Promise<string> {
  try {
    // Extract meeting ID and access token directly from Zoom URL
    const url = new URL(zoomUrl);
    const pathParts = url.pathname.split('/');
    
    let meetingId = pathParts[pathParts.length - 1]; // Last part of path
    let accessToken = '';
    
    // Check if meetingId contains accessToken (with dot)
    if (meetingId.includes('.')) {
      const parts = meetingId.split('.');
      meetingId = parts[0];
      accessToken = parts[1];
    } else {
      // Try to get from query params
      accessToken = url.searchParams.get('token') || url.searchParams.get('access_token') || '';
    }

    // Construct VTT URLs with the format from HTML file
    const ccVttUrl = `https://zoom.us/rec/play/vtt?type=cc&fid=${meetingId}${accessToken ? '.' + accessToken : ''}&action=play`;
    const transcriptVttUrl = `https://zoom.us/rec/play/vtt?type=transcript&fid=${meetingId}${accessToken ? '.' + accessToken : ''}&action=play`;
    
    console.log("Trying direct VTT URLs:");
    console.log("CC URL:", ccVttUrl);
    console.log("Transcript URL:", transcriptVttUrl);

    // Try to fetch both URLs directly
    let vttContent = null;
    let fetchError = null;

    // First try the transcript URL
    try {
      const response = await fetch(transcriptVttUrl);
      if (response.ok) {
        vttContent = await response.text();
        if (vttContent && (vttContent.includes("WEBVTT") || vttContent.trim().startsWith("WEBVTT"))) {
          console.log("Successfully fetched transcript VTT");
          return parseVttContent(vttContent);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch transcript VTT:", error);
      fetchError = error;
    }

    // If transcript failed, try CC URL
    if (!vttContent) {
      try {
        const response = await fetch(ccVttUrl);
        if (response.ok) {
          vttContent = await response.text();
          if (vttContent && (vttContent.includes("WEBVTT") || vttContent.trim().startsWith("WEBVTT"))) {
            console.log("Successfully fetched CC VTT");
            return parseVttContent(vttContent);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch CC VTT:", error);
        fetchError = error;
      }
    }

    // If both direct methods failed, throw
    if (!vttContent) {
      throw fetchError || new Error("Failed to fetch VTT directly");
    }

    return parseVttContent(vttContent);
  } catch (error) {
    console.error("Direct VTT fetch error:", error);
    throw error;
  }
} 