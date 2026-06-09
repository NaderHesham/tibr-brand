document.addEventListener('DOMContentLoaded', () => {
  const authBtn = document.getElementById('auth-btn');
  const authModal = document.getElementById('auth-modal');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const authForm = document.getElementById('auth-form');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authToggleMode = document.getElementById('auth-toggle-mode');
  const authSubmitBtn = document.getElementById('auth-submit-btn');

  const authSignupFields = document.getElementById('auth-signup-fields');
  const authName = document.getElementById('auth-name');
  const authGender = document.getElementById('auth-gender');
  const authDob = document.getElementById('auth-dob');
  const authGoogleBtn = document.getElementById('auth-google-btn');

  const adminPanelBtn = document.getElementById('admin-panel-btn');
  const adminModal = document.getElementById('admin-modal');
  const adminCloseBtn = document.getElementById('admin-close-btn');

  let isLoginMode = true;
  let currentUser = null;
  let currentLang = localStorage.getItem("robabikia-lang") || "ar";
  const authBtnDefaultHTML = authBtn ? authBtn.innerHTML : '';
  const getAccountLabel = () => currentLang === 'en' ? 'My Account' : 'حسابي';

  const parseAuthCallbackError = () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (!error) {
      return null;
    }

    const decodedDescription = errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : '';

    if (decodedDescription.toLowerCase().includes('unable to exchange external code')) {
      return 'تسجيل الدخول عبر Google لم يكتمل لأن إعداد Google Provider في Supabase ما زال غير صحيح. لازم تضيف Google Client ID و Client Secret وتطابق Redirect URL.';
    }

    return decodedDescription || 'حدث خطأ أثناء تسجيل الدخول.';
  };

  const clearAuthCallbackParams = () => {
    if (!window.location.search) return;
    const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  };

  const syncModalMode = () => {
    const title = document.getElementById('auth-modal-title');
    const subtitle = document.getElementById('auth-modal-subtitle');
    const dict = translations[currentLang];

    if (isLoginMode) {
      if (title) title.textContent = dict['auth-login-title'];
      if (subtitle) subtitle.textContent = dict['auth-login-subtitle'];
      authSubmitBtn.textContent = dict['auth-submit-login'];
      authToggleMode.textContent = dict['auth-toggle-to-signup'];
      authSignupFields.style.display = 'none';
      authName.required = false;
      authGender.required = false;
      authDob.required = false;
    } else {
      if (title) title.textContent = dict['auth-signup-title'];
      if (subtitle) subtitle.textContent = dict['auth-signup-subtitle'];
      authSubmitBtn.textContent = dict['auth-submit-signup'];
      authToggleMode.textContent = dict['auth-toggle-to-login'];
      authSignupFields.style.display = 'flex';
      authName.required = true;
      authGender.required = true;
      authDob.required = false;
    }
  };

  const handleSessionChange = async (session) => {
    const dict = translations[currentLang];
    if (session && session.user) {
      currentUser = session.user;
      authBtn.innerHTML = authBtnDefaultHTML;
      authBtn.setAttribute('title', getAccountLabel());
      authBtn.setAttribute('aria-label', getAccountLabel());
      authModal.classList.remove('active');
      document.body.style.overflow = '';

      try {
        const { data: profile } = await window.apiClient.getProfile();

        if (profile && profile.role === 'admin') {
          adminPanelBtn.style.display = 'block';
        } else {
          adminPanelBtn.style.display = 'none';
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        adminPanelBtn.style.display = 'none';
      }
    } else {
      currentUser = null;
      authBtn.innerHTML = authBtnDefaultHTML;
      authBtn.setAttribute('title', dict['auth-login-title']);
      authBtn.setAttribute('aria-label', dict['auth-login-title']);
      adminPanelBtn.style.display = 'none';
    }
  };

  const initAuth = async () => {
    const callbackErrorMessage = parseAuthCallbackError();
    if (callbackErrorMessage) {
      alert(callbackErrorMessage);
      clearAuthCallbackParams();
    }

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    await handleSessionChange(session);

    window.supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await handleSessionChange(session);
    });
  };

  authBtn.addEventListener('click', async () => {
    if (currentUser) {
      window.location.hash = '#account';
    } else {
      isLoginMode = true;
      syncModalMode();
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  authCloseBtn.addEventListener('click', () => {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  authToggleMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    syncModalMode();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value;
    const password = authPassword.value;
    const dict = translations[currentLang];

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = dict['auth-loading'];

    try {
      if (isLoginMode) {
        const { error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        alert(dict['auth-login-success']);
      } else {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: authName.value,
              gender: authGender.value,
              date_of_birth: authDob.value
            }
          }
        });
        if (error) throw error;

        alert(dict['auth-signup-success']);
      }

      authModal.classList.remove('active');
      document.body.style.overflow = '';
      authForm.reset();
    } catch (error) {
      alert(error.message || dict['auth-error']);
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isLoginMode ? dict['auth-submit-login'] : dict['auth-submit-signup'];
    }
  });

  if (authGoogleBtn) {
    authGoogleBtn.addEventListener('click', async () => {
      const dict = translations[currentLang];
      try {
        const redirectUrl = `${window.location.origin}${window.location.pathname}`;
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (error) throw error;
      } catch (err) {
        alert(err.message || dict['auth-google-error']);
      }
    });
  }

  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', () => {
      window.location.hash = '#admin';
    });
  }

  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  const updateAuthUIText = () => {
    const dict = translations[currentLang];

    authBtn.innerHTML = authBtnDefaultHTML;
    authBtn.setAttribute('title', currentUser ? getAccountLabel() : dict['auth-login-title']);
    authBtn.setAttribute('aria-label', currentUser ? getAccountLabel() : dict['auth-login-title']);

    // Update Google button text
    if (authGoogleBtn) {
      authGoogleBtn.textContent = dict['auth-google-btn'];
    }
  };

  // Listen to language changes
  document.addEventListener('languageChanged', (e) => {
    currentLang = e.detail.lang;

    updateAuthUIText();

    // Update modal if it's open
    if (authModal.classList.contains('active')) {
      syncModalMode();
    }
  });

  initAuth().then(() => {
    updateAuthUIText();
  });
});
