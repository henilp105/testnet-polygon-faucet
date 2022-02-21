import React, { useEffect, useState } from 'react'

const ThemeSwitch = () => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const localTheme = localStorage.getItem('theme')
    if (localTheme) {
      setTheme(localTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'light') {
      document.body.classList.remove('dark')
    } else {
      document.body.classList.add('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'light' : 'light')
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-center absolute top-4 left-1/2 transform -translate-x-1/2"
      onClick={toggleTheme}
    >
      <span className={`${theme === 'light'? 'text-yellow-400':'text-gray-500'}`}>
      </span>

      <div
        className={`mx-3 flex h-7 w-14 items-center rounded-full bg-gray-300 px-1 transition-colors duration-200 ${
          theme === 'light' ? 'bg-cyan-400' : 'bg-gray-700'
        }`}
      >
        <div
          className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            theme === 'dark' && 'translate-x-7'
          }`}
        ></div>
      </div>
      <span className={`${theme === 'dark'? 'text-white':'text-gray-400'}`}>
        
      </span>
    </div>
  )
}

export default ThemeSwitch
