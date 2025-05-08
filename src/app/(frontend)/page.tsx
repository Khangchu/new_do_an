import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import './styles.scss'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  const baseClass = 'before-login'
  return (
    <>
      <aside className={baseClass}>
        <div className={`${baseClass}__image-wrap`}>
          <Image src="/image-login1.webp" alt="" fill />
        </div>
      </aside>
      <div className="home">
        <div className="content">
          <picture>
            <source srcSet="/logo.svg" />
            <Image alt="Logo" height={200} src="/logo.svg" width={300} />
          </picture>
          {!user && (
            <h1 className="welcome" data-text="Welcome to your new project">
              Welcome to system
            </h1>
          )}
          {user && <h1>Welcome back, {user.email}</h1>}
          <div className="links">
            <a
              className="admin"
              href={payloadConfig.routes.admin}
              rel="noopener noreferrer"
              target="_blank"
            >
              Go to admin panel
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
