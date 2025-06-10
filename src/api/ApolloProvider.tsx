import { ApolloProvider as Provider } from '@apollo/client'
import client from './apolloClient'

const ApolloProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider client={client}>{children}</Provider>
)

export default ApolloProvider
