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

	// Estados para o modal de redefinição de senha
	const [showResetModal, setShowResetModal] = useState(false);
	const [isResetting, setIsResetting] = useState(false);
	const [newGeneratedPassword, setNewGeneratedPassword] = useState('');

	// Função para buscar configurações do sistema da API
	const fetchSettings = async () => {
		try {
			const { sistemaService } = await import('../../api/services');
			const result = await sistemaService.getConfig();
			const data = result.data;
			console.log('API /api/sistema response:', data); // <-- Adicionado para depuração
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
		console.log('Salvando perfil do admin:', adminProfile);
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
					console.log('SettingsPage: Moeda alterada, disparando evento currencyChanged', {
						de: oldSettings.currency,
						para: generalSettings.currency
					});
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

		try {
			console.log('🔄 Alterando senha do usuário...');
			
			// Importar o serviço de autenticação e fazer a alteração real
			const { authService } = await import('../../api/services');
			const result = await authService.changePassword(passwordData.current, passwordData.new);
			
			if (result.success) {
				console.log('✅ Senha alterada com sucesso');
				
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
					console.warn('Não foi possível atualizar senha no localStorage:', e);
				}
				
			} else {
				console.error('❌ Erro ao alterar senha:', result.error);
				alert(result.error || 'Erro ao alterar senha. Tente novamente.');
			}
			
		} catch (error) {
			console.error('💥 Erro inesperado ao alterar senha:', error);
			alert('Erro inesperado ao alterar senha. Tente novamente.');
		}
	};

	const handleResetPassword = () => {
		setShowResetModal(true);
	};

	// Função para gerar senha aleatória
	const generateRandomPassword = () => {
		const length = 12;
		const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < length; i++) {
			password += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		return password;
	};

	// Função para confirmar a redefinição da senha
	const confirmPasswordReset = async () => {
		setIsResetting(true);
		
		try {
			// Gerar nova senha aleatória
			const newPassword = generateRandomPassword();
			
			// Fazer a alteração real da senha usando a senha atual
			const { authService } = await import('../../api/services');
			const result = await authService.changePassword(passwordData.current, newPassword);
			
			if (result.success) {
				console.log('✅ Senha redefinida com sucesso');
				
				setNewGeneratedPassword(newPassword);
				
				// Atualizar a senha atual no estado local
				setPasswordData(prev => ({
					...prev,
					current: newPassword,
					new: '',
					confirm: ''
				}));

				// Atualizar no localStorage
				try {
					const auth = localStorage.getItem('smartquote_auth');
					if (auth) {
						const parsed = JSON.parse(auth);
						if (parsed.user) {
							parsed.user.password = newPassword;
							localStorage.setItem('smartquote_auth', JSON.stringify(parsed));
						}
					}
				} catch (e) {
					console.warn('Não foi possível atualizar senha no localStorage:', e);
				}

				setSaveSuccess(t('settings.resetPasswordSuccess'));
				setTimeout(() => setSaveSuccess(''), 3000);
			} else {
				console.error('❌ Erro ao redefinir senha:', result.error);
				setSaveSuccess(result.error || t('settings.resetPasswordError'));
				setTimeout(() => setSaveSuccess(''), 3000);
			}
			
		} catch (error) {
			console.error('💥 Erro inesperado ao redefinir senha:', error);
			setSaveSuccess(t('settings.resetPasswordError'));
			setTimeout(() => setSaveSuccess(''), 3000);
		} finally {
			setIsResetting(false);
		}
	};

	// Função para copiar senha para a área de transferência
	const copyPasswordToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(newGeneratedPassword);
			setSaveSuccess(t('settings.passwordCopied'));
			setTimeout(() => setSaveSuccess(''), 2000);
		} catch (error) {
			console.error('Erro ao copiar senha:', error);
		}
	};

	// Função para fechar o modal
	const closeResetModal = () => {
		setShowResetModal(false);
		setNewGeneratedPassword('');
		setIsResetting(false);
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
									<h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>Alterar Senha</h3>
									<p className={`${isLight ? 'text-red-600' : 'text-red-200'} text-xs sm:text-sm`}>Mantenha sua conta segura</p>
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

								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
									<Button
										onClick={handleChangePassword}
										className="flex-1 h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
									>
										<Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										{t('settings.changePassword')}
									</Button>
									<Button
										onClick={handleResetPassword}
										variant="outline"
										className={`flex-1 h-9 sm:h-10 text-sm sm:text-base ${
											isLight 
												? 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400' 
												: 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400'
										}`}
									>
										<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										{t('settings.resetPassword')}
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
										<p className={`${isLight ? 'text-green-600' : 'text-green-200'} text-xs sm:text-sm`}>Configurações globais do sistema</p>
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
										<p className="text-xs sm:text-sm text-dark-secondary">Backup automático diário</p>
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
										<p className="text-xs sm:text-sm text-dark-secondary">Modo de manutenção</p>
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

			{/* Modal de Redefinição de Senha */}
			<Dialog open={showResetModal} onOpenChange={setShowResetModal}>
				<DialogContent className={`max-w-md mx-auto ${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
					<DialogHeader>
						<DialogTitle className={`flex items-center gap-3 ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>
							<div className={`p-2 rounded-lg ${isLight ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
								<RefreshCw className={`w-5 h-5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
							</div>
							{t('settings.resetPasswordModal')}
						</DialogTitle>
						<DialogDescription className={`${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-2`}>
							{!newGeneratedPassword 
								? "Uma nova senha será gerada automaticamente para sua conta."
								: "Nova senha gerada com sucesso! Certifique-se de salvá-la em um local seguro."
							}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						{!newGeneratedPassword ? (
							// Antes da redefinição
							<div className={`p-4 rounded-lg border ${isLight ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
								<div className="flex items-center gap-2 mb-2">
									<AlertCircle className={`w-4 h-4 ${isLight ? 'text-yellow-600' : 'text-yellow-400'}`} />
									<span className={`font-medium text-sm ${isLight ? 'text-yellow-800' : 'text-yellow-200'}`}>
										Atenção
									</span>
								</div>
								<p className={`text-sm ${isLight ? 'text-yellow-700' : 'text-yellow-300'}`}>
									Esta ação irá gerar uma nova senha aleatória e substituir sua senha atual.
									Você precisará usar a nova senha em seus próximos acessos.
								</p>
							</div>
						) : (
							// Após a redefinição - exibir nova senha
							<div className={`p-4 rounded-lg border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-500/10 border-green-500/30'}`}>
								<div className="flex items-center gap-2 mb-3">
									<CheckCircle className={`w-4 h-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
									<span className={`font-medium text-sm ${isLight ? 'text-green-800' : 'text-green-200'}`}>
										Nova Senha Gerada
									</span>
								</div>
								
								<div className="space-y-3">
									<div>
										<Label className={`${isLight ? 'text-green-700' : 'text-green-300'} mb-2 block text-sm font-medium`}>
											Sua nova senha:
										</Label>
										<div className="flex items-center gap-2">
											<div className={`flex-1 p-3 rounded-lg font-mono text-sm border ${
												isLight ? 'bg-white border-green-300 text-gray-800' : 'bg-dark-bg border-green-500/50 text-dark-primary-text'
											} select-all`}>
												{newGeneratedPassword}
											</div>
											<Button
												onClick={copyPasswordToClipboard}
												variant="outline"
												size="sm"
												className={`p-2 ${
													isLight 
														? 'border-green-300 hover:bg-green-50 text-green-700' 
														: 'border-green-500/50 hover:bg-green-500/10 text-green-400'
												}`}
												title="Copiar senha"
											>
												<RefreshCw className="w-4 h-4" />
											</Button>
										</div>
									</div>
									<p className={`text-xs ${isLight ? 'text-green-600' : 'text-green-400'}`}>
										💡 Clique na senha para selecioná-la, ou use o botão para copiar
									</p>
								</div>
							</div>
						)}

						{/* Botões de ação */}
						<div className="flex gap-3 pt-2">
							{!newGeneratedPassword ? (
								<>
									<Button
										onClick={closeResetModal}
										variant="outline"
										className={`flex-1 ${
											isLight 
												? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
												: 'border-dark-color text-dark-secondary hover:bg-dark-hover'
										}`}
										disabled={isResetting}
									>
										Cancelar
									</Button>
									<Button
										onClick={confirmPasswordReset}
										className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
										disabled={isResetting}
									>
										{isResetting ? (
											<>
												<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
												Gerando...
											</>
										) : (
											<>
												<RefreshCw className="w-4 h-4 mr-2" />
												Confirmar
											</>
										)}
									</Button>
								</>
							) : (
								<Button
									onClick={closeResetModal}
									className="w-full bg-green-600 hover:bg-green-700 text-white"
								>
									<CheckCircle className="w-4 h-4 mr-2" />
									Fechar
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
