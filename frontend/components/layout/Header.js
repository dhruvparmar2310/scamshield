import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Menu, X } from 'lucide-react'
import logo from '../../public/logo.png'

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/scam-checker', label: 'Message Checker' },
  { href: '/url-checker', label: 'URL Checker' },
  { href: '/quiz', label: 'Cybersecurity Quiz' },
  { href: '/scan-history', label: 'Scan History' }
]

export default function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false)

    router.events.on('routeChangeComplete', closeMenu)
    router.events.on('routeChangeError', closeMenu)

    return () => {
      router.events.off('routeChangeComplete', closeMenu)
      router.events.off('routeChangeError', closeMenu)
    }
  }, [router.events])

  useEffect(() => {
    if (!menuOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  return (
    <header className='site-header'>
      <Link href='/' className='brand' aria-label='CyberMentis home' onClick={() => setMenuOpen(false)}>
        <img src={logo.src} alt='CyberMentis | CyberSecurity Awareness Platform' />
      </Link>

      <button
        type='button'
        className={`header-menu-toggle ${menuOpen ? 'is-open' : ''}`}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls='CyberMentis-main-nav'
        onClick={() => setMenuOpen((previous) => !previous)}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      <nav id='CyberMentis-main-nav' className={`header-nav ${menuOpen ? 'is-open' : ''}`} aria-label='Main navigation'>
        {navigation.map((item) => {
          const isActive =
            item.href === '/' ? router.pathname === '/' : router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'nav-link-active' : ''}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}