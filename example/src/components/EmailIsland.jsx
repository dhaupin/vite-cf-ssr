import { useEffect, useState } from 'react'

const EMAIL_LOCAL_PART = 'hello'
const EMAIL_DOMAIN = 'creadev.org'

export default function EmailIsland() {
  const [email, setEmail] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Assemble email only on client-side - not visible in source
    setEmail(`${EMAIL_LOCAL_PART}@${EMAIL_DOMAIN}`)
    setLoaded(true)
  }, [])

  if (!loaded) {
    return <span className="island-loading">loading...</span>
  }

  return (
    <a href={`mailto:${email}`} className="contact-email">{email}</a>
  )
}