																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																								import { useState, useEffect, useContext } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { AppContext } from '../../contexts/AppContext';
import {
	User,
	Settings,
	Save,
	Eye,
	EyeOff,
	Lock,
	RefreshCw,
	CheckCircle,
	AlertCircle
} from 'lucide-react';

interface AdminProfile {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	role: string;
	phone: string;
}

interface GeneralSettings {
	systemName: string;
	language: string;
	timezone: string;
	currency: string;
	autoBackup: boolean;
	maintenanceMode: boolean;
}

interface PasswordData {
	current: string;
	new: string;
	confirm: string;
	showCurrent: boolean;
	showNew: boolean;
	showConfirm: boolean;
}

export default function SettingsPage({ isLight = false }: { isLight?: boolean } = {}) {
	const appCtx = useContext(AppContext);
	const { t } = useTranslation();
	const { changeLanguage } = useLanguage();

	const [adminProfile, setAdminProfile] = useState<AdminProfile>({
		firstName: '',
		lastName: '',
		email: '',
		company: 'RCS Angola',
		role: '',
		phone: ''
	});

	const [isAdmin, setIsAdmin] = useState(false);

	// Carregar dados do usuário logado
	useEffect(() => {
		try {
			const raw = localStorage.getItem('smartquote_auth');
			if (raw) {
				const parsed = JSON.parse(raw);
				const user = parsed?.user;
				if (user) {
					setIsAdmin(user.role === 'admin');
					setAdminProfile(prev => ({
						...prev,
						firstName: user.name?.split(' ')[0] || '',
						lastName: user.name?.split(' ').slice(1).join(' ') || '',
						email: user.email || '',
						role: user.role === 'admin' ? 'Administrador' : user.position || user.role || '',
						phone: user.phone || user.contact || ''
					}));

					// Preencher senha atual se disponível
					if (user.password) {
						setPasswordData(prev => ({
							...prev,
							current: user.password
						}));
					}
				}
			}
		} catch (error) {
			console.error('Erro ao carregar dados do usuário:', error);
		}
	}, []);

	const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
		systemName: '',
		language: '',
		timezone: '',
		currency: '',
		autoBackup: true,
		maintenanceMode: true
	});

	const [passwordData, setPasswordData] = useState<PasswordData>({
		current: '',
		new: '',
		confirm: '',
		showCurrent: false,
		showNew: false,
		showConfirm: false
	});

	const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	// Estados para o modal de redefinição de senha (método igual ao esqueci senha)
	const [showTokenModal, setShowTokenModal] = useState(false);
	const [isRequestingToken, setIsRequestingToken] = useState(false);
	const [isResetLoading, setIsResetLoading] = useState(false);
	const [resetToken, setResetToken] = useState('');
	const [newResetPassword, setNewResetPassword] = useState('');
	const [confirmResetPassword, setConfirmResetPassword] = useState('');
	const [showNewResetPassword, setShowNewResetPassword] = useState(false);
	const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
	const [tokenSent, setTokenSent] = useState(false);
	const [resetError, setResetError] = useState('');
	
	// Estados para validação de senha em tempo real
	const [hasMinLength, setHasMinLength] = useState(false);
	const [hasUppercase, setHasUppercase] = useState(false);
	const [hasLowercase, setHasLowercase] = useState(false);
	const [hasNumber, setHasNumber] = useState(false);
	const [hasSpecialChar, setHasSpecialChar] = useState(false);

	// Função para buscar configurações do sistema da API
	const fetchSettings = async () => {
		try {
			const { sistemaService } = await import('../../api/services');
			const result = await sistemaService.getConfig();
			const data = result.data;
			const config = data && data.data ? data.data : null;
			if (config) {
				const sysName = typeof config.nome_empresa === 'string' ? config.nome_empresa.trim() : '';
				setGeneralSettings({
					systemName: sysName,
					language: typeof config.idioma === 'string' ? config.idioma.trim() : '',
					timezone: typeof config.fuso_horario === 'string' ? config.fuso_horario.trim() : '',
					currency: typeof config.moeda === 'string' ? config.moeda.trim() : '',
					autoBackup: config.backup?.trim?.() === 'diario' || config.backup === true,
					maintenanceMode: !!config.manutencao
				});
				if (appCtx?.setSystemName) appCtx.setSystemName(sysName);
			}
		} catch (error) {
			console.error('Erro ao buscar configurações do sistema:', error);
		}
	};

	// Carregar configurações do sistema ao montar
	useEffect(() => {
		fetchSettings();
	}, []);

	useEffect(() => {
		if (saveSuccess) {
			const timer = setTimeout(() => setSaveSuccess(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [saveSuccess]);

	const handleSaveProfile = () => {
		setSaveSuccess(t('settings.profileUpdated'));
	};

	const handleSaveGeneral = async () => {
		const languageMap: { [key: string]: string } = {
			'pt-PT': 'pt',
			'pt-BR': 'pt',
			'en-US': 'en',
			'en-GB': 'en',
			'es-ES': 'es',
			'fr-FR': 'fr',
			'de-DE': 'de',
			'it-IT': 'it'
		};
		const newLang = languageMap[generalSettings.language] || 'pt';

		try {
			// Map frontend state to backend config fields
			const configPayload = {
				nome_empresa: generalSettings.systemName,
				idioma: generalSettings.language,
				fuso_horario: generalSettings.timezone,
				moeda: generalSettings.currency,
				backup: generalSettings.autoBackup ? 'diario' : 'manual',
				manutencao: generalSettings.maintenanceMode
			};

			const { sistemaService } = await import('../../api/services');
			const result = await sistemaService.updateConfig(configPayload);

			if (result.success) {
				// Atualiza dados exibidos após salvar
				await fetchSettings();
				if (appCtx?.setSystemName) appCtx.setSystemName(generalSettings.systemName);
				// Update localStorage and language for immediate UI effect
				const oldSettings = JSON.parse(localStorage.getItem('smartquote-general-settings') || '{}');
				localStorage.setItem('smartquote-language', generalSettings.language);
				localStorage.setItem('smartquote-general-settings', JSON.stringify(generalSettings));
				
				// Disparar evento customizado se a moeda foi alterada
				if (oldSettings.currency !== generalSettings.currency) { 
					window.dispatchEvent(new CustomEvent('currencyChanged', { 
						detail: { 
							oldCurrency: oldSettings.currency, 
							newCurrency: generalSettings.currency 
						} 
					}));
				}
				
				const success = await changeLanguage(newLang);
				if (success) {
					setSaveSuccess(t('settings.languageChanged'));
				} else {
					setSaveSuccess(t('settings.settingsSaved'));
				}
			} else {
				setSaveSuccess(result.error || 'Erro ao salvar configurações do sistema.');
			}
		} catch (error) {
			console.error('Erro ao salvar configurações do sistema:', error);
			setSaveSuccess('Erro ao salvar configurações do sistema.');
		}
	};

	const handleChangePassword = async () => {
		if (passwordData.new !== passwordData.confirm) {
			alert(t('settings.passwordsDoNotMatch'));
			return;
		}

		if (passwordData.new.length < 8) {
			alert(t('settings.passwordTooShort'));
			return;
		}

		if (!passwordData.current) {
			alert(t('settings.currentPasswordRequired'));
			return;
		}
		
		setIsChangingPassword(true);
		
		try {
			const { authService } = await import('../../api/services');
			
			const result = await authService.changePassword(passwordData.current, passwordData.new);
			
			if (result.success) {
				// Limpar os campos de senha
				setPasswordData({
					current: '',
					new: '',
					confirm: '',
					showCurrent: false,
					showNew: false,
					showConfirm: false
				});
				
				// Mostrar sucesso
				setSaveSuccess(result.message || t('settings.passwordChanged'));
				
				// Atualizar a senha atual no localStorage se necessário
				try {
					const auth = localStorage.getItem('smartquote_auth');
					if (auth) {
						const parsed = JSON.parse(auth);
						if (parsed.user) {
							parsed.user.password = passwordData.new;
							localStorage.setItem('smartquote_auth', JSON.stringify(parsed));
						}
					}
				} catch (e) {
					// Silently fail
				}
				
			} else {
				alert(result.error || 'Erro ao alterar senha. Tente novamente.');
			}
			
		} catch (error: any) {
			console.error('📊 Detalhes completos do erro:', {
				name: error?.name,
				message: error?.message,
				stack: error?.stack,
				response: error?.response?.data,
				status: error?.response?.status,
				statusText: error?.response?.statusText
			});
			alert(`Erro inesperado ao alterar senha: ${error?.message || 'Erro desconhecido'}`);
		} finally {
			setIsChangingPassword(false);
		}
	};

	// Função para validar senha em tempo real (igual ao ResetPasswordPage)
	const validatePassword = (password: string) => {
		setHasMinLength(password.length >= 8);
		setHasUppercase(/[A-Z]/.test(password));
		setHasLowercase(/[a-z]/.test(password));
		setHasNumber(/\d/.test(password));
		setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
	};

	// Função para solicitar token de reset (primeiro passo)
	const handleResetPassword = async () => {
		setIsRequestingToken(true);
		setResetError('');

			try {
			
			const userEmail = adminProfile.email;
			
			if (!userEmail) {
				
				try {
					const auth = localStorage.getItem('smartquote_auth');
					if (auth) {
						const parsed = JSON.parse(auth);
						if (parsed?.user?.email) {
							setAdminProfile(prev => ({ ...prev, email: parsed.user.email }));
							setTimeout(() => handleResetPassword(), 100);
							return;
						}
					}
				} catch (e) {
				}
				
				setResetError('Email do usuário não encontrado. Faça login novamente.');
				setIsRequestingToken(false);
				return;
			}

			// Solicitar token via email usando o mesmo método da página esqueci senha
			const { authService } = await import('../../api/services');
			
			const result = await authService.recoverPassword(userEmail);
			
			if (result.success) {
				setTokenSent(true);
				setShowTokenModal(true);
				setSaveSuccess(result.message || 'Token de redefinição enviado para seu email!');
			} else {
				console.error('❌ Erro na solicitação do token:', result.error);
				setResetError(result.error || 'Erro ao solicitar token de redefinição.');
			}
		} catch (error: any) {
			console.error('💥 Erro inesperado ao solicitar token:', error);
			console.error('📊 Detalhes do erro:', {
				name: error?.name,
				message: error?.message,
				stack: error?.stack,
				response: error?.response?.data
			});
			setResetError(`Erro inesperado ao solicitar token: ${error?.message || 'Erro desconhecido'}`);
		} finally {
			setIsRequestingToken(false);
		}
	};

	// Função para redefinir senha com token (segundo passo - igual ao ResetPasswordPage)
	const handleTokenReset = async () => {
		setResetError('');
		
		// Validações
		if (!resetToken.trim()) {
			setResetError('Por favor, insira o token recebido por email.');
			return;
		}

		if (!newResetPassword || !confirmResetPassword) {
			setResetError('Por favor, preencha todos os campos de senha.');
			return;
		}

		if (newResetPassword !== confirmResetPassword) {
			setResetError('As senhas não coincidem.');
			return;
		}

		// Validar critérios de senha
		const passwordValidation = {
			hasMinLength,
			hasUppercase,
			hasLowercase,
			hasNumber,
			hasSpecialChar
		};		
		if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
			setResetError('A senha não atende aos critérios de segurança.');
			return;
		}

		setIsResetLoading(true);

		try {
			const { authService } = await import('../../api/services');
			
			const result = await authService.resetPassword(resetToken.trim(), newResetPassword);
			
			if (result.success) {
				setSaveSuccess(result.message || 'Senha alterada com sucesso!');
				
				// Fechar modal e limpar estados
				setShowTokenModal(false);
				setResetToken('');
				setNewResetPassword('');
				setConfirmResetPassword('');
				setTokenSent(false);
				setResetError('');
				
				// Atualizar a senha no localStorage se necessário
				try {
					const auth = localStorage.getItem('smartquote_auth');
					if (auth) {
						const parsed = JSON.parse(auth);
						if (parsed.user) {
							parsed.user.password = newResetPassword;
							localStorage.setItem('smartquote_auth', JSON.stringify(parsed));
						}
					}
				} catch (e) {
				}
				
				// Limpar mensagem após 3 segundos
				setTimeout(() => setSaveSuccess(''), 3000);
			} else {
				setResetError(result.error || 'Erro ao redefinir senha.');
			}
		} catch (error: any) {
			console.error('📊 Detalhes completos do erro:', {
				name: error?.name,
				message: error?.message,
				stack: error?.stack,
				response: error?.response?.data,
				status: error?.response?.status,
				statusText: error?.response?.statusText
			});
			setResetError(`Erro inesperado ao redefinir senha: ${error?.message || 'Erro desconhecido'}`);
		} finally {
			setIsResetLoading(false);
		}
	};

	// Função para fechar o modal de token
	const closeTokenModal = () => {
		setShowTokenModal(false);
		setResetToken('');
		setNewResetPassword('');
		setConfirmResetPassword('');
		setTokenSent(false);
		setResetError('');
		setIsRequestingToken(false);
		setIsResetLoading(false);
	};

	return (
		<div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-dark-bg'} flex flex-col overflow-hidden`}>
			{/* Header */}
			<header className={`${isLight ? 'bg-white border-gray-200' : 'bg-dark-bg border-dark-color'} border-b px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-5 xl:py-6 flex-shrink-0`}>
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
					<div className="flex items-center space-x-3 sm:space-x-4">
						<div className={`p-2 ${isLight ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-br from-blue-600/20 to-purple-600/20'} rounded-xl`}>
							<Settings className={`w-5 h-5 sm:w-6 sm:h-6 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
						</div>
						<div>
							<h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>
								{t('settings.systemSettings')}
							</h1>
							<p className={`${isLight ? 'text-gray-600' : 'text-dark-secondary'} text-xs sm:text-sm lg:text-base mt-1`}>
								{t('settings.subtitle')}
							</p>
						</div>
					</div>

					{/* Status Notification */}
					{saveSuccess && (
						<div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl ${isLight ? 'bg-green-50 border-green-200 text-green-700' : 'bg-green-500/10 border-green-500/20 text-green-300'} border self-start sm:self-auto`}>
							<div className="flex items-center space-x-2">
								<Save className="w-4 h-4 sm:w-5 sm:h-5" />
								<span className="font-medium text-sm sm:text-base">{saveSuccess}</span>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Main Content */}
			<main className={`flex-1 overflow-y-auto scrollable-content dashboard-main p-3 sm:p-4 lg:p-6 xl:p-8 ${isLight ? 'bg-gray-50' : 'bg-dark-bg'} max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-90px)] md:max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-110px)] xl:max-h-[calc(100vh-120px)]`}>
				{/* Profile Section - Fluid Design */}
				<div className="relative mb-4 sm:mb-6 lg:mb-8">
					<div className={`absolute inset-0 ${isLight ? 'bg-white/80 backdrop-blur-sm' : 'bg-dark-card backdrop-blur-3xl'} rounded-2xl sm:rounded-[2rem]`}></div>
					<div className={`relative glass-card ${isLight ? 'bg-white/90 border-gray-200' : 'bg-dark-card border-dark-color'} rounded-2xl sm:rounded-[2rem] border overflow-hidden shadow-2xl backdrop-blur-sm`}>
						<div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-cyan-50/80' : 'bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5'}`}></div>

						<div className="relative p-4 sm:p-6 lg:p-8">
							{/* Section Header */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
								<div className="flex items-center space-x-3 sm:space-x-4">
									<div className={`p-2 sm:p-3 ${isLight ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-br from-blue-600/20 to-purple-600/20'} rounded-xl sm:rounded-2xl backdrop-blur-sm`}>
										<User className={`w-5 h-5 sm:w-6 sm:h-6 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
									</div>
									<div>
										<h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary-text'} mb-1`}>{t('settings.adminProfile')}</h2>
										<p className={`${isLight ? 'text-blue-600' : 'text-blue-200'} text-sm`}>{t('settings.personalInfo')}</p>
									</div>
								</div>

								{isAdmin && (
									<Button
										onClick={handleSaveProfile}
										className="h-9 sm:h-10 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl text-sm sm:text-base w-full sm:w-auto"
									>
										<Save className="w-4 h-4 mr-2" />
										Salvar Perfil
									</Button>
								)}
							</div>

							{/* Profile Form - Flowing Layout */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
								<div className="space-y-3 sm:space-y-4 lg:space-y-5">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
										<div>
											<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm font-medium`}>{t('settings.firstName')}</Label>
											<Input
												value={adminProfile.firstName}
												onChange={(e) => setAdminProfile({ ...adminProfile, firstName: e.target.value })}
												disabled={!isAdmin}
												className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} backdrop-blur-sm text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
											/>
										</div>
										<div>
											<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm font-medium`}>Posição</Label>
											<Input
												value={adminProfile.role}
												onChange={(e) => setAdminProfile({ ...adminProfile, role: e.target.value })}
												disabled={!isAdmin}
												className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} backdrop-blur-sm text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
											/>
										</div>
									</div>

									<div>
										<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm font-medium`}>{t('settings.email')}</Label>
										<Input
											type="email"
											value={adminProfile.email}
											onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
											disabled={!isAdmin}
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} backdrop-blur-sm text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
										/>
									</div>
								</div>

								<div className="space-y-3 sm:space-y-4 lg:space-y-5">
									<div>
										<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm font-medium`}>{t('Empresa')}</Label>
										<Input
											value={adminProfile.company}
											onChange={(e) => setAdminProfile({ ...adminProfile, company: e.target.value })}
											disabled
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} backdrop-blur-sm text-sm sm:text-base opacity-60 cursor-not-allowed`}
										/>
									</div>

									<div>
										<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm font-medium`}>Contacto</Label>
										<Input
											type="tel"
											value={adminProfile.phone}
											onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
											placeholder="Ex: +244 900 000 000"
											disabled={!isAdmin}
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} backdrop-blur-sm text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
										/>
									</div>
								</div>
							</div>
							<br />
						</div>
					</div>
				</div>

				{/* Password & General Settings Row */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
					{/* Password Management */}
					<div className="relative">
						<div className={`absolute inset-0 ${isLight ? 'bg-white/80 backdrop-blur-sm' : 'bg-dark-card backdrop-blur-2xl'} rounded-2xl sm:rounded-3xl`}></div>
						<div className={`relative glass-card ${isLight ? 'bg-white/90 border-gray-200' : 'bg-dark-card border-dark-color'} rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl p-4 sm:p-6`}>
							<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
								<div className={`p-2 ${isLight ? 'bg-gradient-to-br from-red-100 to-red-200' : 'bg-gradient-to-br from-red-600/20 to-red-500/20'} rounded-xl`}>
									<Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
								</div>
								<div>
									<h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>{t('settings.changePassword')}</h3>
									<p className={`${isLight ? 'text-red-600' : 'text-red-200'} text-xs sm:text-sm`}>{t('settings.keepAccountSecure')}</p>
								</div>
							</div>

							<div className="space-y-4 sm:space-y-6">
								<div className="relative">
									<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>Senha Atual</Label>
									<div className="relative">
										<Input
											type={passwordData.showCurrent ? "text" : "password"}
											value={passwordData.current}
											onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
											placeholder="Digite sua senha atual"
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} pr-12 text-sm sm:text-base`}
										/>
										<button
											type="button"
											onClick={() => setPasswordData({ ...passwordData, showCurrent: !passwordData.showCurrent })}
											className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-dark-secondary hover:text-dark-primary-text'}`}
										>
											{passwordData.showCurrent ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
										</button>
									</div>
								</div>

								<div className="relative">
									<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>Nova Senha</Label>
									<div className="relative">
										<Input
											type={passwordData.showNew ? "text" : "password"}
											value={passwordData.new}
											onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
											placeholder="Digite sua nova senha (mínimo 8 caracteres)"
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} pr-12 text-sm sm:text-base`}
										/>
										<button
											type="button"
											onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })}
											className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-dark-secondary hover:text-dark-primary-text'}`}
										>
											{passwordData.showNew ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
										</button>
									</div>
								</div>

								<div className="relative">
									<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>Confirmar Nova Senha</Label>
									<div className="relative">
										<Input
											type={passwordData.showConfirm ? "text" : "password"}
											value={passwordData.confirm}
											onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
											placeholder="Digite novamente sua nova senha"
											className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} pr-12 text-sm sm:text-base`}
										/>
										<button
											type="button"
											onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
											className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-dark-secondary hover:text-dark-primary-text'}`}
										>
											{passwordData.showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
										</button>
									</div>
								</div>

								<div className="flex justify-end">
									<Button
										onClick={handleChangePassword}
										disabled={isChangingPassword}
										className="h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-6 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isChangingPassword ? (
											<>
												<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
												Alterando...
											</>
										) : (
											<>
												<Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
												{t('settings.changePassword')}
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* General Settings */}
					<div className="relative">
						<div className={`absolute inset-0 ${isLight ? 'bg-white/80 backdrop-blur-sm' : 'bg-dark-card backdrop-blur-2xl'} rounded-2xl sm:rounded-3xl`}></div>
						<div className={`relative glass-card ${isLight ? 'bg-white/90 border-gray-200' : 'bg-dark-card border-dark-color'} rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl p-4 sm:p-6`}>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
								<div className="flex items-center space-x-3 sm:space-x-4">
									<div className={`p-2 ${isLight ? 'bg-gradient-to-br from-green-100 to-blue-100' : 'bg-gradient-to-br from-green-600/20 to-blue-600/20'} rounded-xl`}>
										<Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
									</div>
									<div>
										<h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>{t('settings.generalSettings')}</h3>
										<p className={`${isLight ? 'text-green-600' : 'text-green-200'} text-xs sm:text-sm`}>{t('settings.globalSystemSettings')}</p>
									</div>
								</div>
								{isAdmin && (
									<Button
										onClick={handleSaveGeneral}
										className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 h-8 sm:h-9 text-sm sm:text-base w-full sm:w-auto"
									>
										<Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
										Salvar
									</Button>
								)}
							</div>

							<div className="space-y-3 sm:space-y-4">
								<div>
									<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>{t('settings.systemName')}</Label>
									<Input
										value={generalSettings.systemName}
										onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
										disabled={!isAdmin}
										className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500' : 'bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary'} text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
									/>
								</div>

								<div>
									<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>{t('settings.language')}</Label>
									<Select
										value={generalSettings.language}
										onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
										disabled={!isAdmin}
									>
										<SelectTrigger className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-dark-card border-dark-color text-dark-primary-text'} text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className={`${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
											<SelectItem value="pt-PT" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Português (Portugal)</SelectItem>
											<SelectItem value="pt-BR" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Português (Brasil)</SelectItem>
											<SelectItem value="en-US" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>English (US)</SelectItem>
											<SelectItem value="en-GB" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>English (UK)</SelectItem>
											<SelectItem value="es-ES" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Español</SelectItem>
											<SelectItem value="fr-FR" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Français</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>{t('settings.timezone')}</Label>
										<Select
											value={generalSettings.timezone}
											onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
											disabled={!isAdmin}
										>
											<SelectTrigger className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-dark-card border-dark-color text-dark-primary-text'} text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className={`${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
												<SelectItem value="Europe/Lisbon" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Lisboa</SelectItem>
												<SelectItem value="Europe/Madrid" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Madrid</SelectItem>
												<SelectItem value="Europe/London" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Londres</SelectItem>
												<SelectItem value="Europe/Paris" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Paris</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label className={`${isLight ? 'text-gray-700' : 'text-dark-primary-text'} mb-2 block text-sm`}>{t('settings.currency')}</Label>
										<Select
											value={generalSettings.currency}
											onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
											disabled={!isAdmin}
										>
											<SelectTrigger className={`h-9 sm:h-10 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-dark-card border-dark-color text-dark-primary-text'} text-sm sm:text-base ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className={`${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
												<SelectItem value="EUR" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Euro (€)</SelectItem>
												<SelectItem value="USD" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Dólar Americano ($)</SelectItem>
												<SelectItem value="GBP" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Libra Esterlina (£)</SelectItem>
												<SelectItem value="BRL" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Real Brasileiro (R$)</SelectItem>
												<SelectItem value="JPY" className={`${isLight ? 'text-gray-800 hover:bg-gray-100' : 'text-dark-primary-text hover:bg-dark-hover'} text-sm sm:text-base`}>Iene Japonês (¥)</SelectItem>
												<SelectItem value="CHF" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Franco Suíço (CHF)</SelectItem>
												<SelectItem value="CAD" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Dólar Canadense (C$)</SelectItem>
												<SelectItem value="AOA" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Kwanza Angolano (Kz)</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex items-center justify-between py-1">
									<div>
										<Label className="text-dark-primary-text text-sm">{t('settings.autoBackup')}</Label>
										<p className="text-xs sm:text-sm text-dark-secondary">{t('settings.dailyAutoBackup')}</p>
									</div>
									<Switch
										checked={generalSettings.autoBackup}
										onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, autoBackup: checked })}
										disabled={!isAdmin}
										className={`data-[state=checked]:bg-blue-600 ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
									/>
								</div>

								<div className="flex items-center justify-between py-1">
									<div>
										<Label className="text-dark-primary-text text-sm">{t('settings.maintenanceMode')}</Label>
										<p className="text-xs sm:text-sm text-dark-secondary">{t('settings.maintenanceModeDesc')}</p>
									</div>
									<Switch
										checked={generalSettings.maintenanceMode}
										onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
										disabled={!isAdmin}
										className={`data-[state=checked]:bg-blue-600 ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Modal de Redefinição de Senha com Token */}
			<Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
				<DialogContent className={`max-w-md mx-auto ${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
					<DialogHeader>
						<DialogTitle className={`flex items-center gap-3 ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>
							<div className={`p-2 rounded-lg ${isLight ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
								<Lock className={`w-5 h-5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
							</div>
							Redefinir Senha
						</DialogTitle>
						<DialogDescription className={`${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-2`}>
							{tokenSent 
								? "Insira o token recebido por email e defina sua nova senha."
								: "Enviando token para seu email..."
							}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						{resetError && (
							<div className={`p-3 rounded-lg border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/30'}`}>
								<div className="flex items-center gap-2">
									<AlertCircle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
									<span className={`text-sm ${isLight ? 'text-red-800' : 'text-red-200'}`}>
										{resetError}
									</span>
								</div>
							</div>
						)}

						{tokenSent && (
							<>
								{/* Campo do Token */}
								<div className="space-y-2">
									<Label htmlFor="resetToken" className={`${isLight ? 'text-gray-700' : 'text-dark-secondary'} font-medium`}>
										Token de Verificação
									</Label>
									<Input
										id="resetToken"
										type="text"
										placeholder="Insira o token recebido por email"
										value={resetToken}
										onChange={(e) => setResetToken(e.target.value)}
										className={`${isLight 
											? 'border-gray-300 focus:border-orange-500 bg-white text-gray-900' 
											: 'border-dark-color focus:border-orange-400 bg-dark-bg text-dark-primary-text'
										} font-mono tracking-wider`}
									/>
									<p className={`text-xs ${isLight ? 'text-gray-500' : 'text-dark-tertiary'}`}>
										Verifique sua caixa de entrada e spam
									</p>
								</div>

								{/* Campo Nova Senha */}
								<div className="space-y-2">
									<Label htmlFor="newResetPassword" className={`${isLight ? 'text-gray-700' : 'text-dark-secondary'} font-medium`}>
										Nova Senha
									</Label>
									<div className="relative">
										<Input
											id="newResetPassword"
											type={showNewResetPassword ? "text" : "password"}
											placeholder="Digite sua nova senha"
											value={newResetPassword}
											onChange={(e) => {
												setNewResetPassword(e.target.value);
												validatePassword(e.target.value);
											}}
											className={`${isLight 
												? 'border-gray-300 focus:border-orange-500 bg-white text-gray-900' 
												: 'border-dark-color focus:border-orange-400 bg-dark-bg text-dark-primary-text'
											} pr-10`}
										/>
										<button
											type="button"
											onClick={() => setShowNewResetPassword(!showNewResetPassword)}
											className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
												isLight ? 'text-gray-400 hover:text-gray-600' : 'text-dark-tertiary hover:text-dark-secondary'
											}`}
										>
											{showNewResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
								</div>

								{/* Campo Confirmar Senha */}
								<div className="space-y-2">
									<Label htmlFor="confirmResetPassword" className={`${isLight ? 'text-gray-700' : 'text-dark-secondary'} font-medium`}>
										Confirmar Nova Senha
									</Label>
									<div className="relative">
										<Input
											id="confirmResetPassword"
											type={showConfirmResetPassword ? "text" : "password"}
											placeholder="Confirme sua nova senha"
											value={confirmResetPassword}
											onChange={(e) => setConfirmResetPassword(e.target.value)}
											className={`${isLight 
												? 'border-gray-300 focus:border-orange-500 bg-white text-gray-900' 
												: 'border-dark-color focus:border-orange-400 bg-dark-bg text-dark-primary-text'
											} pr-10`}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
											className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
												isLight ? 'text-gray-400 hover:text-gray-600' : 'text-dark-tertiary hover:text-dark-secondary'
											}`}
										>
											{showConfirmResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
								</div>

								{/* Critérios de Validação de Senha */}
								{newResetPassword && (
									<div className={`p-3 rounded-lg border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-dark-bg border-dark-color'}`}>
										<h4 className={`text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-dark-secondary'}`}>
											Critérios de Senha:
										</h4>
										<div className="space-y-1">
											{[
												{ condition: hasMinLength, text: 'Mínimo de 8 caracteres' },
												{ condition: hasUppercase, text: 'Uma letra maiúscula' },
												{ condition: hasLowercase, text: 'Uma letra minúscula' },
												{ condition: hasNumber, text: 'Um número' },
												{ condition: hasSpecialChar, text: 'Um caractere especial' }
											].map((criterion, index) => (
												<div key={index} className="flex items-center gap-2">
													{criterion.condition ? (
														<CheckCircle className="w-4 h-4 text-green-500" />
													) : (
														<AlertCircle className={`w-4 h-4 ${isLight ? 'text-gray-400' : 'text-dark-tertiary'}`} />
													)}
													<span className={`text-xs ${
														criterion.condition 
															? 'text-green-600' 
															: isLight ? 'text-gray-500' : 'text-dark-tertiary'
													}`}>
														{criterion.text}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
							</>
						)}

						{/* Botões de Ação */}
						<div className="flex gap-3 pt-2">
							<Button
								onClick={closeTokenModal}
								variant="outline"
								className={`flex-1 ${
									isLight 
										? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
										: 'border-dark-color text-dark-secondary hover:bg-dark-hover'
								}`}
								disabled={isResetLoading || isRequestingToken}
							>
								Cancelar
							</Button>
							
							{tokenSent && (
								<Button
									onClick={handleTokenReset}
									className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
									disabled={isResetLoading || !resetToken.trim() || !newResetPassword || !confirmResetPassword}
								>
									{isResetLoading ? (
										<>
											<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
											Redefinindo...
										</>
									) : (
										<>
											<Lock className="w-4 h-4 mr-2" />
											Redefinir
										</>
									)}
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
