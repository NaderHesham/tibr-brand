/* reviews.js — Product Reviews in Modal */

window.reviews = {
  currentProductId: null,

  async load(productId) {
    this.currentProductId = productId;
    const section = document.getElementById('modal-reviews-section');
    if (!section) return;

    const lang = window.utils?.getCurrentLang() || 'ar';
    document.getElementById('reviews-list').innerHTML =
      '<div class="spinner" style="margin:1rem auto;width:24px;height:24px;border-width:2px;"></div>';

    try {
      const { data } = await window.apiClient.getReviews(productId);
      this._renderList(data || [], lang);
      await this._renderForm(lang);
    } catch {
      document.getElementById('reviews-list').innerHTML = '';
    }
  },

  _stars(rating, max = 5) {
    return Array.from({ length: max }, (_, i) =>
      `<span class="star${i < rating ? ' star-filled' : ''}">★</span>`
    ).join('');
  },

  _renderList(reviews, lang) {
    const listEl  = document.getElementById('reviews-list');
    const avgEl   = document.getElementById('reviews-avg-stars');
    const countEl = document.getElementById('reviews-count');
    if (!listEl) return;

    if (reviews.length === 0) {
      if (avgEl)   avgEl.innerHTML = this._stars(0);
      if (countEl) countEl.textContent = lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet';
      listEl.innerHTML = '';
      return;
    }

    const avg = Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);
    if (avgEl)   avgEl.innerHTML = this._stars(avg);
    if (countEl) countEl.textContent = lang === 'ar' ? `${reviews.length} تقييم` : `${reviews.length} reviews`;

    listEl.innerHTML = reviews.map(r => {
      const name = r.profiles?.full_name || (lang === 'ar' ? 'مستخدم' : 'User');
      const date = new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG');
      return `
        <div class="review-card">
          <div class="review-header">
            <div class="review-meta">
              <span class="review-author">${name}</span>
              <span class="review-date">${date}</span>
            </div>
            <div class="review-stars">${this._stars(r.rating)}</div>
          </div>
          ${r.body ? `<p class="review-body">${r.body}</p>` : ''}
        </div>`;
    }).join('');
  },

  async _renderForm(lang) {
    const formEl = document.getElementById('add-review-section');
    if (!formEl) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
      formEl.innerHTML = `<p class="review-login-prompt">
        <a href="#login">${lang === 'ar' ? 'سجّل دخولك لإضافة تقييم' : 'Log in to add a review'}</a>
      </p>`;
      return;
    }

    let selectedRating = 0;
    formEl.innerHTML = `
      <h4 class="add-review-title">${lang === 'ar' ? 'أضف تقييمك' : 'Add Your Review'}</h4>
      <div class="star-picker" id="star-picker">
        ${[1,2,3,4,5].map(i => `<button class="star-btn" data-rating="${i}" type="button">★</button>`).join('')}
      </div>
      <textarea id="review-body-input" class="review-textarea"
        placeholder="${lang === 'ar' ? 'اكتب رأيك... (اختياري)' : 'Write your review... (optional)'}"></textarea>
      <button id="submit-review-btn" class="btn btn-gold" disabled>
        ${lang === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
      </button>`;

    const picker    = document.getElementById('star-picker');
    const submitBtn = document.getElementById('submit-review-btn');

    picker?.addEventListener('click', e => {
      const btn = e.target.closest('.star-btn');
      if (!btn) return;
      selectedRating = Number(btn.dataset.rating);
      picker.querySelectorAll('.star-btn').forEach((b, i) =>
        b.classList.toggle('star-filled', i < selectedRating));
      submitBtn.disabled = false;
    });

    submitBtn?.addEventListener('click', async () => {
      if (!selectedRating) return;
      submitBtn.disabled = true;
      submitBtn.textContent = lang === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...';

      try {
        const body = document.getElementById('review-body-input')?.value?.trim() || null;
        await window.apiClient.submitReview(this.currentProductId, { rating: selectedRating, body });
        window.utils?.showToast(lang === 'ar' ? 'شكراً! تم إرسال تقييمك ✓' : 'Review submitted ✓', 'success');
        this.load(this.currentProductId);
      } catch (err) {
        window.utils?.showToast(
          err.message || (lang === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review'), 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = lang === 'ar' ? 'إرسال التقييم' : 'Submit Review';
      }
    });
  }
};
