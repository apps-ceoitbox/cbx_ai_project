import { useEffect, useState } from 'react'

function useReRenderEffect(cb, deps) {
    const [mount, setMount] = useState(false);

    useEffect(() => {
        if (!mount) {
            return setMount(true)
        }
        return cb()
    }, deps)
}

export default useReRenderEffect