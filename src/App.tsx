import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewState = 'gate' | 'login' | 'reset_email' | 'reset_password' | 'reset_complete';

export default function App() {
  const [view, setView] = useState<ViewState>('gate');
  
  // Login states
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdError, setLoginIdError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Reset states
  const [resetLoginId, setResetLoginId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation states for Reset
  const [resetEmailError, setResetEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    
    if (!id) {
      setLoginIdError('ID를 입력해 주세요.');
      hasError = true;
    } else {
      setLoginIdError('');
    }
    
    if (!password) {
      setLoginPasswordError('비밀번호를 입력해 주세요.');
      hasError = true;
    } else {
      // Mock error for invalid credentials
      setLoginPasswordError('ID 또는 비밀번호가 일치하지 않습니다.');
      hasError = true;
    }

    if (hasError) return;
    
    console.log('Login attempt', { id, password });
  };

  const validateEmail = (email: string) => {
    if (!email) return '이메일을 입력해 주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '이메일 형식으로 입력해 주세요.';
    return '';
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(resetEmail);
    if (emailErr) {
      setResetEmailError(emailErr);
      return;
    }
    setResetEmailError('');
    
    if (!resetLoginId) return; // ID 필수는 기본 html validation (required) 사용
    
    setIsCodeSent(true);
    showToast('인증번호가 이메일로 발송되었습니다.');
  };

  const validateCode = (code: string) => {
    if (!code) return '인증번호를 입력해 주세요.';
    const isValid = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{5}$/.test(code);
    if (!isValid) return '인증번호는 5자리 영문, 숫자 혼합이어야 합니다.';
    return '';
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCode(verificationCode);
    if (err) {
      setVerificationCodeError(err);
      return;
    }
    setView('reset_password');
  };

  const handleResendCode = () => {
    showToast('이메일이 재발송되었습니다.');
  };

  const validateNewPassword = (pass: string) => {
    if (!pass) return '비밀번호를 입력해 주세요.';
    if (pass.length < 8) return '비밀번호는 최소 8자 이상 입력해 주세요.';
    
    const typesCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(regex => regex.test(pass)).length;
    if (typesCount < 3) return '영문 소문자, 영문 대문자, 숫자, 특수문자 중 3가지 이상을 포함해 주세요.';
    
    return '';
  };

  const validateConfirmPassword = (confirm: string, newPass: string) => {
    if (!confirm) return '비밀번호 확인을 입력해 주세요.';
    if (!newPass) return '먼저 비밀번호를 입력해 주세요.';
    if (confirm !== newPass) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPassErr = validateNewPassword(newPassword);
    const confirmPassErr = validateConfirmPassword(confirmPassword, newPassword);
    
    setNewPasswordError(newPassErr);
    setConfirmPasswordError(confirmPassErr);

    if (!newPassErr && !confirmPassErr) {
      setView('reset_complete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans pb-20">
      <motion.div
        className="max-w-[460px] w-full"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        
          <AnimatePresence mode="wait">
            {view === 'gate' && (
              <motion.div key="gate" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }} className="text-center py-6">
                <h2 className="text-[20px] font-bold text-gray-900 mb-8">화면 퍼블리싱 목록</h2>
                <div className="flex flex-col space-y-3">
                  <button onClick={() => setView('login')} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200">
                    로그인
                  </button>
                  <button onClick={() => setView('reset_email')} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200">
                    비밀번호 재설정 - 이메일 인증
                  </button>
                  <button onClick={() => setView('reset_password')} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200">
                    비밀번호 재설정 - 새 비밀번호 설정
                  </button>
                  <button onClick={() => setView('reset_complete')} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200">
                    비밀번호 재설정 - 완료
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'login' && (
              <motion.div key="login" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                {/* Header area clearly indicating Admin/Backoffice */}
                <div className="text-center mb-10">
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-3">
                    하나은행 전사 ERP 시스템 관리자
                  </h1>
                  <h2 className="text-lg font-medium text-gray-800 mb-4">
                    마스터 백오피스 로그인
                  </h2>
                  <p className="text-[13px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                    모든 기업의 ERP 시스템 통합 관리 및<br/>
                    운영을 위한 마스터 관리자 전용 페이지입니다.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="adminId" className="block text-sm font-semibold text-gray-800">
                      마스터 관리자 사번 (ID)
                    </label>
                    <input
                      id="adminId"
                      type="text"
                      placeholder="사번을 입력하세요"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                        if (loginIdError) setLoginIdError('');
                      }}
                      onBlur={() => {
                        if (!id) setLoginIdError('ID를 입력해 주세요.');
                      }}
                      className={`w-full px-4 py-3.5 rounded-lg border ${loginIdError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400`}
                    />
                    {loginIdError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{loginIdError}</p>}
                  </div>

                  <div className={`space-y-1.5 relative ${loginIdError ? 'mt-8' : 'mt-6'}`}>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginPasswordError) setLoginPasswordError('');
                        }}
                        onBlur={() => {
                          if (!password) setLoginPasswordError('비밀번호를 입력해 주세요.');
                        }}
                        className={`w-full px-4 py-3.5 pr-10 rounded-lg border ${loginPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginPasswordError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{loginPasswordError}</p>}
                  </div>

                  <div className={`flex items-center ${loginPasswordError ? 'mt-8' : 'mt-4'}`}>
                    <div className="flex items-center h-5">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#008d75] focus:ring-[#008d75] cursor-pointer accent-[#008d75]"
                      />
                    </div>
                    <div className="ml-2 text-sm">
                      <label htmlFor="rememberMe" className="text-gray-700 cursor-pointer">
                        사번 저장
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#008485] hover:bg-[#007071] text-white font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008485]"
                  >
                    마스터 계정으로 로그인
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center items-center space-x-6 text-[13px] font-medium text-gray-600">
                  <a href="#" className="hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300">마스터 권한 요청</a>
                  <span className="text-gray-300 border-l border-gray-300 h-3" aria-hidden="true"></span>
                  <button type="button" onClick={() => {
                    setView('reset_email');
                    setIsCodeSent(false);
                    setResetLoginId('');
                    setResetEmail('');
                    setVerificationCode('');
                    setResetEmailError('');
                    setVerificationCodeError('');
                    setLoginIdError('');
                    setLoginPasswordError('');
                  }} className="hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300">시스템 비밀번호 재설정</button>
                </div>
              </motion.div>
            )}

            {view === 'reset_email' && (
              <motion.div key="reset_email" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">비밀번호 재설정</h2>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    비밀번호를 재설정하려면 본인인증이 필요합니다.<br/>
                    본인인증은 기업에서 공통으로 설정한 인증방법으로 진행됩니다.
                  </p>
                </div>

                <form onSubmit={isCodeSent ? handleVerifyCode : handleSendEmail} className="space-y-6" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="resetLoginId" className="block text-sm font-semibold text-gray-800">
                      아이디 (ID)
                    </label>
                    <input
                      id="resetLoginId"
                      type="text"
                      placeholder="사번을 입력하세요"
                      value={resetLoginId}
                      onChange={(e) => setResetLoginId(e.target.value)}
                      disabled={isCodeSent}
                      className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008d75] focus:border-[#008d75] transition-colors outline-none text-sm placeholder-gray-400 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label htmlFor="resetEmail" className="block text-sm font-semibold text-gray-800">
                      이메일
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      placeholder="email@email.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetEmailError) setResetEmailError('');
                      }}
                      onBlur={() => {
                        if (!isCodeSent) setResetEmailError(validateEmail(resetEmail));
                      }}
                      disabled={isCodeSent}
                      className={`w-full px-4 py-3.5 rounded-lg border ${resetEmailError && !isCodeSent ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                    />
                    {!isCodeSent && resetEmailError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{resetEmailError}</p>}
                  </div>

                  {isCodeSent && (
                    <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} transition={{duration: 0.3}} className={`space-y-6 ${resetEmailError ? 'pt-6' : 'pt-2'}`}>
                       <div className="space-y-1.5">
                         <div className="flex justify-between items-end mb-2">
                           <label htmlFor="verifyCode" className="block text-sm font-semibold text-gray-800">
                             인증번호 입력
                           </label>
                           <button type="button" onClick={handleResendCode} className="text-xs font-medium text-[#008d75] hover:text-[#007071] transition-colors">
                             재발송
                           </button>
                         </div>
                         <input
                           id="verifyCode"
                           type="text"
                           placeholder="5자리 영숫자 입력"
                           value={verificationCode}
                           onChange={(e) => {
                             setVerificationCode(e.target.value);
                             if (verificationCodeError) setVerificationCodeError('');
                           }}
                           onBlur={() => {
                             setVerificationCodeError(validateCode(verificationCode));
                           }}
                           className={`w-full px-4 py-3.5 rounded-lg border ${verificationCodeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400 uppercase`}
                           maxLength={5}
                           required
                         />
                         {verificationCodeError ? (
                           <p className="text-red-500 text-xs mt-2">{verificationCodeError}</p>
                         ) : (
                           <p className="text-xs text-gray-500 mt-2">
                             메일로 받은 인증번호를 입력해 주세요. (스팸함 확인)
                           </p>
                         )}
                      </div>
                    </motion.div>
                  )}

                  {!isCodeSent ? (
                    <div className={`flex space-x-3 ${resetEmailError ? 'pt-6' : 'pt-2'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setView('login');
                          setResetEmailError('');
                          setLoginIdError('');
                          setLoginPasswordError('');
                        }}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#009b82] hover:bg-[#008485] text-white font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008485]"
                      >
                        이메일 발송
                      </button>
                     </div>
                  ) : (
                    <div className="pt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCodeSent(false);
                          setVerificationCode('');
                          setResetEmailError('');
                          setVerificationCodeError('');
                        }}
                        className="w-[100px] shrink-0 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 font-medium text-[14px] py-4 px-2 rounded-lg transition-colors duration-200"
                      >
                        이전
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#009b82] hover:bg-[#008485] text-white font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008485]"
                      >
                        인증 확인
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            )}

            {view === 'reset_password' && (
              <motion.div key="reset_password" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">새 비밀번호 설정</h2>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    인증이 완료되었습니다.<br/>
                    로그인에 사용할 새 비밀번호를 입력해 주세요.
                  </p>
                </div>

                <form onSubmit={handleSetNewPassword} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="newPassword" className="block text-[14px] font-semibold text-gray-800">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (newPasswordError) setNewPasswordError('');
                          if (confirmPassword) setConfirmPasswordError(validateConfirmPassword(confirmPassword, e.target.value));
                        }}
                        onBlur={(e) => setNewPasswordError(validateNewPassword(e.target.value))}
                        className={`w-full px-4 py-3.5 pr-10 rounded-lg border ${newPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPasswordError ? (
                      <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{newPasswordError}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        * 영문 소문자, 영문 대문자, 숫자, 특수문자 중 3가지 이상을 포함해 주세요.
                      </p>
                    )}
                  </div>

                  <div className={`space-y-1.5 relative ${newPasswordError ? 'mt-8' : 'mt-6'}`}>
                    <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-gray-800">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError('');
                        }}
                        onBlur={(e) => setConfirmPasswordError(validateConfirmPassword(e.target.value, newPassword))}
                        className={`w-full px-4 py-3.5 pr-10 rounded-lg border ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#008d75] focus:border-[#008d75]'} transition-colors outline-none text-sm placeholder-gray-400`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPasswordError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{confirmPasswordError}</p>}
                  </div>

                  <div className={`flex space-x-3 ${confirmPasswordError ? 'pt-6' : 'pt-2'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setNewPasswordError('');
                        setConfirmPasswordError('');
                        setLoginIdError('');
                        setLoginPasswordError('');
                      }}
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#009b82] hover:bg-[#008485] text-white font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008485]"
                    >
                      비밀번호 변경
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'reset_complete' && (
              <motion.div key="reset_complete" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }} className="text-center py-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">비밀번호 설정 완료</h2>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-10">
                  비밀번호가 정상적으로 설정되었습니다.<br/>
                  변경한 비밀번호로 로그인해 서비스를 이용해 주세요.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setResetLoginId('');
                    setResetEmail('');
                    setIsCodeSent(false);
                    setVerificationCode('');
                    setVerificationCodeError('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setLoginIdError('');
                    setLoginPasswordError('');
                  }}
                  className="w-full bg-[#009b82] hover:bg-[#008485] text-white font-medium text-[15px] py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008485]"
                >
                  로그인
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </motion.div>

      {/* Toast Notification for Resend/Errors */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 bg-[#1a1a1a] text-white px-5 py-3.5 rounded-lg shadow-lg flex items-center justify-between w-[90%] max-w-[460px] text-[13px] z-50"
          >
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white transition-colors ml-4 focus:outline-none">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'gate' && (
        <button
          onClick={() => setView('gate')}
          className="fixed bottom-6 right-6 bg-gray-800/90 hover:bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all z-50 backdrop-blur-sm"
        >
          목록으로 이동
        </button>
      )}
    </div>
  );
}

