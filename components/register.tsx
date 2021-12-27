import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import useUser from '../lib/use-user'
import fetchJson from '../lib/fetch-json'
import Layout from './layout'

const siteTitle = 'Register'

const RegisterComponent = () => {
  const router = useRouter()

  const [message, setMessage] = React.useState('')
  const [user, setUser] = React.useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    userRole: 'none',
  })

  const { mutateUser } = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = `${process.env.apiKey}/register`

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        id: 0,
        name: user.userName,
        email: user.userEmail,
        password: user.userPassword,
        role: user.userRole,
      }),
    }

    try {
      mutateUser(await fetchJson(process.env.apiKey + '/register', fetchOptions))
    } catch (error) {
      console.log(error)
      setMessage('Nama user dan email salah, atau sudah terdaftar.')
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
    {/*
      <Form onSubmit={handleSubmit}>
        <Flex
          justifySelf="center"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          alignSelf="center">
          <View padding="size-100">
            <View
              marginTop="20%"
              borderWidth="thick"
              borderColor="green-400"
              backgroundColor="chartreuse-400"
              borderRadius="large"
              paddingX="size-500"
              paddingBottom="size-500"
              maxWidth="size-4600">
              <Flex
                direction="column"
                justifyContent="center"
                gap="size-300"
                alignContent="center"
                alignItems="center">
                <h2>Register</h2>
                <TextField
                  aria-label="Username"
                  width="100%"
                  type="text"
                  placeholder="e.g. titan"
                  onChange={(e) => handleChange('userName', e)}
                />
                <TextField
                  flex
                  width="100%"
                  placeholder="e.g. your-name@gmail.com"
                  aria-label="Email"
                  onChange={(e) => handleChange('userEmail', e)}
                />
                <TextField
                  flex
                  width="100%"
                  placeholder="e.g. wet/@456#xx2"
                  aria-label="Password"
                  type="password"
                  onChange={(e) => handleChange('userPassword', e)}
                />
                <View>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {message}
                  </span>
                </View>
                <Button type="submit" flex variant="cta" width="100%">
                  Login
                </Button>
                <View marginTop="size-300">
                  Jika anda sudah punya akun, silahkan{' '}
                  <Link href="/login">
                    <a>Login</a>
                  </Link>
                </View>
              </Flex>
            </View>
          </View>
        </Flex>
      </Form>
    */}
    </Layout>
  )
}

export default RegisterComponent
