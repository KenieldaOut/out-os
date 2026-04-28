import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'

const ERROR_MESSAGES = {
  'auth/invalid-credential':       'E-mail ou senha incorretos.',
  'auth/user-not-found':           'Nenhuma conta encontrada com esse e-mail.',
  'auth/wrong-password':           'Senha incorreta.',
  'auth/invalid-email':            'Formato de e-mail inválido.',
  'auth/user-disabled':            'Esta conta foi desativada.',
  'auth/too-many-requests':        'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed':   'Erro de conexão. Verifique sua internet.',
  'auth/email-already-in-use':     'Já existe uma conta com esse e-mail.',
  'auth/weak-password':            'A senha deve ter pelo menos 6 caracteres.',
}

function friendlyError(code) {
  return ERROR_MESSAGES[code] ?? 'Ocorreu um erro inesperado. Tente novamente.'
}

export async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return { user: credential.user, error: null }
  } catch (err) {
    return { user: null, error: friendlyError(err.code) }
  }
}

export async function register(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return { user: credential.user, error: null }
  } catch (err) {
    return { user: null, error: friendlyError(err.code) }
  }
}

export async function logout() {
  await signOut(auth)
}
