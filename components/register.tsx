import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import useUser from '../lib/useUser'
import fetchJson from '../lib/fetchJson'
import Layout from './layout-2'
import { Button, Flex, Form, TextField, View } from '@adobe/react-spectrum'
import Link from 'next/link'

const siteTitle = 'Register'

const RegisterComponent = () => {
  const router = useRouter()

  const [message, setMessage] = React.useState('')
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })

  const { mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = `${process.env.apiKey}/register`;

    const body = {
      id: 0,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    }

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        userData: body
      }),
    }

    try {
      mutateUser(await fetchJson(url, fetchOptions))
    } catch (error) {
      //console.log(error)
      setMessage('Nama user dan email sudah terdaftar.')
      //      console.error('An unexpected error happened:', error);
      // setErrorMsg(error.data.message);
    }
  }

  const handleChange = (name: string, value: string) => {
    setUser({ ...user, [name]: value })
  }

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Form onSubmit={handleSubmit}>
        <Flex
          // justifySelf="center"
          justifyContent="end"
        // alignItems="center"
        // alignContent="center"
        // alignSelf="center"
        >
          <View padding="size-100">
            <View
              // marginTop="20%"
              // borderWidth="thick"
              // borderColor="green-400"
              // backgroundColor="chartreuse-400"
              // borderRadius="large"
              // paddingX="size-500"
              // paddingBottom="size-500"
              backgroundColor={"indigo-700"}
              borderRadius="large"
              padding="size-500"
              maxWidth="size-4600">
              <Flex
                direction="column"
                justifyContent="center"
                gap="size-300"
                alignContent="center"
                alignItems="center">
                <h2 style={{ color: '#fff', fontWeight: 700 }}>Register</h2>
                <TextField
                  aria-label="Username"
                  width="100%"
                  value={user.name}
                  autoFocus
                  placeholder="e.g. titan"
                  onChange={(e) => handleChange('name', e)}
                />
                <TextField
                  flex
                  width="100%"
                  placeholder="e.g. your-name@gmail.com"
                  aria-label="Email"
                  value={user.email}
                  onChange={(e) => handleChange('email', e)}
                />
                <TextField
                  flex
                  width="100%"
                  placeholder="e.g. wet/@456#xx2"
                  aria-label="Password"
                  value={user.password}
                  type="password"
                  onChange={(e) => handleChange('password', e)}
                />
                <View>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {message}
                  </span>
                </View>
                <Button type="submit" flex variant="cta" width="100%">
                  Register Now
                </Button>
                <div style={{ marginTop: "24px", color: '#fff' }}>
                  Jika anda sudah punya akun, silahkan{' '}
                  <Link href="/login">
                    <a style={{ color: '#fff', fontWeight: 700 }}>Login</a>
                  </Link>
                </div>
              </Flex>
            </View>
          </View>
        </Flex>
      </Form>
    </Layout>
  )
}

export default RegisterComponent
