import Head from 'next/head';
import React, { FormEvent, useState } from 'react';
import useUser from '@lib/useUser';
import fetchJson from '@lib/fetchJson';
import Layout from '@components/layout';
import { Button, Flex, Form, TextField, View } from '@adobe/react-spectrum';
import Link from 'next/link';

const siteTitle = 'UserLogin';

const LoginComponent = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  })

  const { mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      mutateUser(
        await fetchJson(process.env.apiKey + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })
      )
    } catch (error) {
      console.error('An unexpected error happened:', error)
      //setErrorMsg(error.data.message);
    }
  }

  const handleChange = (name: string, value: string) => {
    setUserData({ ...userData, [name]: value })
  }

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      
      <Form onSubmit={handleSubmit}>
        <Flex
          justifySelf="center"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          alignSelf="center"
        >
          <View padding="size-100">
            <View
              marginTop="20%"
              borderWidth="thick"
              borderColor="green-400"
              backgroundColor="chartreuse-400"
              borderRadius="large"
              padding="size-500"
              maxWidth="size-4600"
            >
              <Flex
                direction="column"
                justifyContent="center"
                gap="size-300"
                alignContent="center"
                alignItems="center"
              >
                <h2>Login</h2>
                <TextField
                  aria-label="Username"
                  width="100%"
                  type="text"
                  onChange={(e) => handleChange('email', e)}
                />
                <TextField
                  flex
                  width="100%"
                  aria-label="Password"
                  type="password"
                  onChange={(e) => handleChange('password', e)}
                />
                <Button type="submit" flex variant="cta" width="100%">
                  Login
                </Button>
                <View marginTop="size-300">
                  Jika anda belum punya akun, silahkan{' '}
                  <Link href="/register" passHref>
                    <a>Register</a>
                  </Link>{' '}
                  dulu.
                </View>
              </Flex>
            </View>
          </View>
        </Flex>
      </Form>
    </Layout>
  )
}

export default LoginComponent
