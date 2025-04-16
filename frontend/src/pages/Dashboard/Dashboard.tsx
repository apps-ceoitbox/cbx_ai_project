// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { Logo } from "@/components/logo"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { ArrowLeft, FilePlus, FileText, LogOut } from "lucide-react"
// import { useAxios, useData } from "@/context/AppContext"
// import { templateCategories } from "../Admin/Admin"
// import {
//   Settings,
//   Megaphone,
//   HandCoins,
//   Banknote,
//   Users,
//   BarChart,
//   ShieldCheck,
//   FolderX
// } from "lucide-react";


// export interface PromptInterface {
//   _id: string;
//   heading: string;
//   category: string;
//   visibility: boolean;
//   objective: string;
//   initialGreetingsMessage: string;
//   questions: string[];
//   knowledgeBase: string[];
//   promptTemplate: string;
//   defaultAiProvider: DefaultAiProvider;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface DefaultAiProvider {
//   name: string;
//   model: string;
// }



// export default function Dashboard() {
//   const { userAuth, setUserAuth } = useData();
//   const axios = useAxios("user");
//   const nav = useNavigate();

//   const [tools, setTools] = useState<PromptInterface[]>([])
//   const [selectedCategory, setSelectedCategory] = useState(null);


//   useEffect(() => {
//     if (!userAuth.user) {
//       nav("/login")
//     }
//   }, [userAuth, nav])

//   if (!userAuth.user) {
//     return null
//   }

//   const handleToolClick = (toolId: string) => {

//     nav(`/tools/${toolId}`)
//   }

//   useEffect(() => {
//     const fetchTools = async () => {
//       const response = await axios.get("/prompt")
//       setTools(response.data.data)
//     }
//     fetchTools()
//   }, [])

//   const filteredTools = tools?.filter(tool => tool.category == selectedCategory && tool.visibility)

//   const categoryIcons = {
//     Operations: <Settings className="h-6 w-6" />,
//     Marketing: <Megaphone className="h-6 w-6" />,
//     Sales: <HandCoins className="h-6 w-6" />,
//     Finance: <Banknote className="h-6 w-6" />,
//     HR: <Users className="h-6 w-6" />,
//     Strategy: <BarChart className="h-6 w-6" />,
//     Compliances: <ShieldCheck className="h-6 w-6" />,
//   };


//   return (
//     <div className="min-h-screen bg-gray-50" >

//       <header className="bg-black text-white p-4 px-10 shadow-md">
//         <div className=" mx-auto flex justify-between items-center">
//           <Logo size="sm" />
//           <div className="flex items-center gap-4">
//             <div className="text-sm">
//               <div className="font-medium">{userAuth.user.name}</div>
//               <div className="text-gray-300">{userAuth.user.company}</div>
//             </div>

//             <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
//               onClick={() => {
//                 nav("/generated-plans")
//               }}
//             >
//               <FilePlus className="w-5 h-5" />
//               Generated Plans
//             </Button>
//             <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white" onClick={() => {
//               localStorage.removeItem("userToken")
//               setUserAuth(p => ({ ...p, user: null, token: null }))
//               nav("/login")
//             }}>
//               <LogOut className="w-5 h-5" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className=" mx-auto py-8 px-10">

//         <div className="flex  justify-between">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Welcome, {userAuth.user.userName}</h1>
//             <p className="text-gray-600 mb-8">Select a {selectedCategory ? "tool" : "category"} to get started</p>
//           </div>
//           {selectedCategory &&
//             <Button onClick={() => setSelectedCategory(null)}
//               style={{ minWidth: "100px" }} variant="ghost" className="mr-4" >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back
//             </Button>
//           }
//         </div>


//         {!selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {templateCategories.map((category) => (
//             <Card
//               onClick={() => setSelectedCategory(category)}
//               key={category}
//               className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-red"
//             >
//               <CardHeader className="pb-2">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 rounded-full bg-primary-red text-white">
//                     {categoryIcons[category] || <FileText className="h-6 w-6" />}
//                   </div>
//                   <CardTitle className="text-xl">{category}</CardTitle>
//                 </div>
//               </CardHeader>
//               <CardFooter>
//                 <Button onClick={() => setSelectedCategory(category)} variant="ghost" className="w-full text-primary-red hover:bg-red-50">
//                   {/* <ArrowRight className="w-4 h-4" /> */}
//                   Click here
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>}

//         {selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

//           {
//             filteredTools.length === 0 ?
//               <div className="w-full flex flex-col col-span-3 items-center justify-center text-gray-500 py-8 gap-2">
//                 <FolderX className="w-10 h-10 text-primary-red" />
//                 <div className="text-lg font-semibold">No tools found</div>
//                 <div className="text-sm text-center max-w-md">
//                   It looks like there’s no tool data available in this category. Please select another or check back later.
//                 </div>
//               </div>
//               :

//               tools.filter(tool => tool.category == selectedCategory && tool.visibility).map((tool) => (

//                 <Card
//                   key={tool._id}
//                   className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-red"
//                   onClick={() => handleToolClick(tool._id)}
//                 >
//                   <div>
//                     <CardHeader className="pb-2">
//                       <div className="flex items-center gap-2">
//                         <div className="p-2 rounded-full bg-primary-red text-white">
//                           <FileText className="h-6 w-6" />
//                         </div>
//                         <CardTitle className="text-xl">{tool.heading}</CardTitle>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <CardDescription className="text-base">{tool.objective}</CardDescription>
//                     </CardContent>
//                   </div>
//                   <CardFooter >
//                     <Button variant="ghost" className="w-full text-primary-red hover:bg-red-50">
//                       Start Now
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               ))}


//         </div>}
//       </main>
//     </div>
//   )
// }





import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FilePlus, FileText, Loader2, LogOut } from "lucide-react"
import { useAxios, useData } from "@/context/AppContext"
import { templateCategories } from "../Admin/Admin"
import {
  Settings,
  Megaphone,
  HandCoins,
  Banknote,
  Users,
  BarChart,
  ShieldCheck,
  FolderX
} from "lucide-react";
import { toast } from "sonner"
import Header from "./Header"

export interface PromptInterface {
  _id: string;
  heading: string;
  category: string;
  visibility: boolean;
  objective: string;
  initialGreetingsMessage: string;
  questions: string[];
  knowledgeBase: string[];
  promptTemplate: string;
  defaultAiProvider: DefaultAiProvider;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultAiProvider {
  name: string;
  model: string;
}

// Category card component with animations and backgrounds
const CategoryCard = ({ category, onClick, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Background patterns and images specific to each category
  const getCategoryBackground = () => {
    switch (category) {
      case 'Operations':
        return {
          backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070')",
          backgroundPattern: "radial-gradient(circle, rgba(255,0,0,0.1) 10%, transparent 10.5%), radial-gradient(circle, rgba(255,0,0,0.1) 10%, transparent 10.5%)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Marketing':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/05/89/42/79/240_F_589427987_DHuYZn4ZIhPQVSA5aoQYiWw5inuKCWig.jpg')",
          backgroundPattern: "linear-gradient(45deg, rgba(255,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(255,0,0,0.1) 50%, rgba(255,0,0,0.1) 75%, transparent 75%, transparent)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Sales':
        return {
          backgroundImage: "url('https://t3.ftcdn.net/jpg/01/93/45/64/240_F_193456449_YNEfRylKS3ftw3gMtqeDD3oMo9rZduH1.jpg')",
          backgroundPattern: "linear-gradient(90deg, rgba(255,0,0,0.1) 50%, transparent 50%)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Finance':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/02/68/73/69/240_F_268736974_pFiPUxyhe3nT1ziSUQ229N1hRt89n8IS.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'HR':
        return {
          backgroundImage: "url('https://t3.ftcdn.net/jpg/04/06/02/96/240_F_406029666_HXoRQoU8ojjpcDiSKRSe34DOF5EIyeP5.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Strategy':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/10/68/79/25/240_F_1068792506_Qr9ytC1SGzCFh0lQKwOWiKs7mUAU07hv.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Compliances':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/11/14/07/35/240_F_1114073584_IR0CLjhz0C48WnTKdxbFwLlsnK5R2qRh.jpg')",
          backgroundSize: "cover, 50px 50px",
          backgroundPosition: "center, 0 0"
        };
      default:
        return {
          backgroundImage: "url('https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2071')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        };
    }
  };

  const bgStyles = getCategoryBackground();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer ${isHovered ? "border-red-600 shadow-lg translate-y-[-8px]" : "border-gray-200"
        }`}
      style={{
        height: '220px',
        // backgroundImage: `${bgStyles.backgroundPattern || ''}, ${bgStyles.backgroundImage}`,
        backgroundImage: ` ${bgStyles.backgroundImage}`,
        backgroundSize: bgStyles.backgroundSize,
        backgroundPosition: bgStyles.backgroundPosition
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between z-20 p-5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-red-600 text-white transition-all duration-300 ${isHovered ? "rotate-12 scale-110" : ""
            }`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{category}</h3>
        </div>

        <div className="mt-auto">
          <button
            className={`w-full py-2 rounded-md text-center font-medium transition-all duration-300 ${isHovered
              ? "bg-red-600 text-white"
              : "bg-white/90 text-red-600"
              }`}
          >
            Click here
            <span className={`ml-2 inline-block transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
              }`}>
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { userAuth } = useData();
  const axios = useAxios("user");
  const nav = useNavigate();

  const [tools, setTools] = useState<PromptInterface[]>([])
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToolClick = (toolId: string) => {
    nav(`/tools/${toolId}`)
  }

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/prompt")
        setTools(response?.data?.data)
      } catch (error) {
        console.error("Error fetching tools:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTools()
  }, [])


  useEffect(() => {
    if (!userAuth.user) {
      nav("/login")
    }
  }, [userAuth, nav])


  if (!userAuth.user) {
    return null
  }

  const filteredTools = tools?.filter(tool => tool.category == selectedCategory && tool.visibility)


  const categoryIcons = {
    Operations: <Settings className="h-6 w-6" />,
    Marketing: <Megaphone className="h-6 w-6" />,
    Sales: <HandCoins className="h-6 w-6" />,
    Finance: <Banknote className="h-6 w-6" />,
    HR: <Users className="h-6 w-6" />,
    Strategy: <BarChart className="h-6 w-6" />,
    Compliances: <ShieldCheck className="h-6 w-6" />,
  };


  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="px-10 mx-auto py-8">
        <div className="flex justify-between">
          <div >

            <h1 className="text-3xl font-bold mb-2">Welcome, {userAuth.user.userName}</h1>
            <p className="text-gray-600 mb-8">Select a {selectedCategory ? "tool" : "category"} to get started</p>
          </div>
          {selectedCategory &&
            <Button
              onClick={() => setSelectedCategory(null)}
              style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
              className=" bg-primary-red  hover:bg-red-700 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

          }
        </div>

        {!selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCategories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              icon={categoryIcons[category] || <FileText className="h-6 w-6" />}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>}

        {selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            filteredTools.length === 0 ?
              <div className="w-full flex flex-col col-span-3 items-center justify-center text-gray-500 py-8 gap-2">
                <FolderX className="w-10 h-10 text-red-600" />
                <div className="text-lg font-semibold">No tools found</div>
                <div className="text-sm text-center max-w-md">
                  It looks like there's no tool data available in this category. Please select another or check back later.
                </div>
              </div>
              :
              tools.filter(tool => tool.category == selectedCategory && tool.visibility).map((tool) => (
                <Card
                  key={tool._id}
                  className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-600"
                  onClick={() => handleToolClick(tool._id)}
                >
                  <div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-red-600 text-white">
                          <FileText className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{tool.heading}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{tool.objective}</CardDescription>
                    </CardContent>
                  </div>
                  <CardFooter>
                    <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50">
                      Start Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
          }
        </div>}
        {isLoading &&
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
          </div>
        }
      </main>

    </div>
  )
} 