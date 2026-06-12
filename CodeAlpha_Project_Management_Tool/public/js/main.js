// Toggle modal visibility helper
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('open');
  }
}

// Close modal when clicking outside contents
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModal(e.target);
  }
});

function closeModal(modalEl) {
  modalEl.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // Bind task creation trigger button
  const btnOpenTaskModal = document.getElementById('btn-open-task-modal');
  if (btnOpenTaskModal) {
    btnOpenTaskModal.addEventListener('click', () => {
      toggleModal('create-task-modal');
    });
  }
});
