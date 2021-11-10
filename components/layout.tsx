import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { iUserLogin } from '@components/interfaces'

export const siteTitle = 'SPBU'

type LayoutProps = {
  activeMenu?: string
  children: React.ReactNode
  home?: boolean
  user?: iUserLogin
  mutateUser?: (data?: any, shouldRevalidate?: boolean | undefined) => Promise<any>
}

const Layout: NextPage<LayoutProps> = ({ children, home, user, mutateUser, activeMenu }) => {
  const router = useRouter()

  return (
    <div></div>
    /*
    <Grid areas={['header', 'content', 'footer']} columns={['1fr']}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn how to build a personal website using Next.js" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <View gridArea="header" backgroundColor="gray-50">
        <TabMainMenu
          home={home}
          user={user}
          mutateUser={mutateUser}
          router={router}
          activeMenu={activeMenu}
        />
      </View>
      <View gridArea="content" backgroundColor="gray-50">
        {children}
      </View>
      <View gridArea="footer" height="size-1000" backgroundColor="gray-50">
        <Divider size="S" />
        <View marginX="size-200" marginTop="size-200">
          <span style={{ fontSize: 'small' }}>Copyright &copy; 2021. FYC</span>
        </View>
      </View>
    </Grid>
    */
  )
}

export default Layout
