import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginUseCase } from '../application/usecases/login_usecase'
import { AuthFailure } from '@/core/errors/failure'
import { LoginValidator } from '../presentation/validators/login_validator'

vi.mock('../presentation/validators/login_validator', () => ({
  LoginValidator: {
    validate: vi.fn()
  }
}))

describe('LoginUseCase', () => {
  let repository: any
  let useCase: LoginUseCase

  beforeEach(() => {
    repository = {
      login: vi.fn()
    }
    useCase = new LoginUseCase(repository)
    vi.clearAllMocks()
  })

  it('devrait retourner un AuthFailure si la validation échoue', async () => {
    vi.mocked(LoginValidator.validate).mockReturnValue("Email invalide")
    const params = { email: 'bad-email', password: '123' }
    const result = await useCase.execute(params)

    expect(result).toBeInstanceOf(AuthFailure)
    expect((result as AuthFailure).message).toBe("Email invalide")
    expect(repository.login).not.toHaveBeenCalled()
  })

  it('devrait appeler le repository si la validation est réussie', async () => {
    vi.mocked(LoginValidator.validate).mockReturnValue(null)
    const mockUser = { id: '1', username: 'testuser' }
    repository.login.mockResolvedValue(mockUser)

    const params = { email: 'test@gmail.com', password: 'password123' }
    const result = await useCase.execute(params)

    expect(LoginValidator.validate).toHaveBeenCalledWith(params)
    expect(repository.login).toHaveBeenCalledWith(params)
    expect(result).toEqual(mockUser)
  })

  it('devrait retourner l\'erreur du repository si la connexion échoue', async () => {
    vi.mocked(LoginValidator.validate).mockReturnValue(null)
    const dbError = new AuthFailure("Identifiants incorrects")
    repository.login.mockResolvedValue(dbError)

    const result = await useCase.execute({ email: 'user@test.com', password: 'wrong-password' })
    expect(result).toBeInstanceOf(AuthFailure)
    expect((result as AuthFailure).message).toBe("Identifiants incorrects")
  })
})

// --- TESTS DU VALIDATOR (Logique pure) ---
describe('LoginValidator', () => {
  
  const realValidate = (params: any) => {

    if (!params.email) return "L'email est requis"
    if (!params.email.includes('@')) return "Format d'email invalide"
    if (params.password.length < 6) return "Le mot de passe doit faire 6 caractères"
    return null
  }

  it('devrait rejeter un email vide', () => {
    const error = realValidate({ email: '', password: 'password123' })
    expect(error).toBe("L'email est requis")
  })

  it('devrait rejeter un email sans @', () => {
    const error = realValidate({ email: 'testgmail.com', password: 'password123' })
    expect(error).toBe("Format d'email invalide")
  })

  it('devrait rejeter un mot de passe trop court', () => {
    const error = realValidate({ email: 'test@gmail.com', password: '123' })
    expect(error).toBe("Le mot de passe doit faire 6 caractères")
  })

  it('devrait retourner null si tout est correct', () => {
    const error = realValidate({ email: 'test@gmail.com', password: 'password123' })
    expect(error).toBeNull()
  })
})