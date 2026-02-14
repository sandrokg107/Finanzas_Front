import { useContext } from 'react'
import AuthContext from '../context/authContextBase'

const useAuth = () => useContext(AuthContext)

export default useAuth
