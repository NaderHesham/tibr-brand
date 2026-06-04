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

  const syncModalMode = () => {
    const title = document.getElementById('auth-modal-title');
    const subtitle = document.getElementById('auth-modal-subtitle');

    if (isLoginMode) {
      if (title) title.textContent = 'تسجيل الدخول';
      if (subtitle) subtitle.textContent = 'أهلاً بعودتك في روبابيكيا';
      authSubmitBtn.textContent = 'دخول';
      authToggleMode.textContent = 'ليس لديك حساب؟ إنشاء حساب جديد';
      authSignupFields.style.display = 'none';
      authName.required = false;
      authGender.required = false;
      authDob.required = false;
    } else {
      if (title) title.textContent = 'إنشاء حساب جديد';
      if (subtitle) subtitle.textContent = 'انضم إلى عائلة روبابيكيا الراقية';
      authSubmitBtn.textContent = 'إنشاء حساب';
      authToggleMode.textContent = 'لديك حساب بالفعل؟ تسجيل الدخول';
      authSignupFields.style.display = 'flex';
      authName.required = true;
      authGender.required = true;
      authDob.required = false;
    }
  };

  const handleSessionChange = async (session) => {
    if (session && session.user) {
      currentUser = session.user;
      authBtn.textContent = 'تسجيل الخروج';
      authModal.classList.remove('active');
      document.body.style.overflow = '';

      try {
        const { data: profile } = await window.supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

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
      authBtn.textContent = 'تسجيل الدخول';
      adminPanelBtn.style.display = 'none';
    }
  };

  const initAuth = async () => {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    await handleSessionChange(session);

    window.supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await handleSessionChange(session);
    });
  };

  authBtn.addEventListener('click', async () => {
    if (currentUser) {
      await window.supabaseClient.auth.signOut();
      alert('تم تسجيل الخروج بنجاح');
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

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'جاري التحميل...';

    try {
      if (isLoginMode) {
        const { error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        alert('تم تسجيل الدخول بنجاح!');
      } else {
        const { error } = await window.supabaseClient.auth.signUp({
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
        alert('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني إذا تطلب الأمر.');
      }

      authModal.classList.remove('active');
      document.body.style.overflow = '';
      authForm.reset();
    } catch (error) {
      alert(error.message || 'حدث خطأ. حاول مرة أخرى.');
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isLoginMode ? 'دخول' : 'إنشاء حساب';
    }
  });

  if (authGoogleBtn) {
    authGoogleBtn.addEventListener('click', async () => {
      try {
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err) {
        alert(err.message || 'خطأ أثناء تسجيل الدخول عبر Google');
      }
    });
  }

  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', () => {
      adminModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  initAuth();
});
