import Swal from 'sweetalert2';

// Pre-themed SweetAlert2 instance matching the pink brand palette.
export const swal = Swal.mixin({
  confirmButtonColor: '#B81C5C',
  cancelButtonColor: '#9B124A',
  buttonsStyling: true,
});

export function toast(title: string, icon: 'success' | 'error' | 'info' = 'success') {
  return swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}
