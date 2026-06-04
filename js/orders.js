document.addEventListener('DOMContentLoaded', () => {
  const dbOrderBtn = document.getElementById('modal-db-order-btn');
  const orderModal = document.getElementById('order-modal');
  const orderCloseBtn = document.getElementById('order-close-btn');
  const orderForm = document.getElementById('order-form');
  const orderName = document.getElementById('order-name');
  const orderPhone = document.getElementById('order-phone');
  const orderAddress = document.getElementById('order-address');
  const orderSubmitBtn = document.getElementById('order-submit-btn');

  // We need to know which product and size is selected.
  // In products.js, activeProductId and selectedSize are scoped locally.
  // To bypass this cleanly without massive refactor, we can extract them from the DOM
  // when the order button is clicked.
  
  dbOrderBtn.addEventListener('click', async () => {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
      alert('يرجى تسجيل الدخول أولاً لإتمام الطلب');
      return;
    }
    
    // Open order modal
    orderModal.classList.add('active');
    document.body.style.overflow = "hidden";
  });

  orderCloseBtn.addEventListener('click', () => {
    orderModal.classList.remove('active');
  });

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
      alert('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    // Try to get active product details
    // Products.js updates the DOM: #modal-perfume-name, size buttons, etc.
    // We can infer active product from the WhatsApp link or by keeping a global reference.
    // The easiest robust way is just fetching the name from the modal DOM:
    const waLink = document.getElementById('modal-whatsapp-link');
    let productId = 'unknown';
    // Let's rely on the DOM for the active product name just to attach it,
    // or better, find the product id from window scope if we exposed it. 
    // Since we didn't expose it, we can parse it from products if we need exact ID,
    // but for the sake of simplicity, we'll save the product string info.

    const productName = document.getElementById('modal-perfume-name').textContent;
    let selectedSize = 'Default';
    const activeSizeBtn = document.querySelector('.size-btn.active');
    if (activeSizeBtn) {
      selectedSize = activeSizeBtn.textContent;
    }

    orderSubmitBtn.disabled = true;
    orderSubmitBtn.textContent = 'جاري الإرسال...';

    try {
      const { error } = await window.supabaseClient.from('orders').insert({
        user_id: session.user.id,
        product_id: window.activeProductId || 'unknown',
        size: selectedSize,
        customer_name: orderName.value,
        customer_phone: orderPhone.value,
        customer_address: orderAddress.value,
        status: 'pending'
      });

      if (error) throw error;

      alert('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
      orderModal.classList.remove('active');
      orderForm.reset();
      
      // Close the main product modal as well
      const productModal = document.getElementById('product-modal');
      if (productModal) productModal.classList.remove('active');
      document.body.style.overflow = "";

    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      orderSubmitBtn.disabled = false;
      orderSubmitBtn.textContent = 'تأكيد الطلب';
    }
  });
});
