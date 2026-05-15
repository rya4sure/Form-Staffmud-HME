document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('peminatan-form');
    const closedMessage = document.getElementById('closed-message');

    function checkTime() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // Buka: 17:59, Tutup: 18:06
        const isOpen = (hour === 17 && minute >= 59) || (hour === 18 && minute < 6);

        if (isOpen) {
            if (form && form.style.display === 'none') {
                form.style.display = 'block';
            }
            if (closedMessage && closedMessage.style.display !== 'none') {
                closedMessage.style.display = 'none';
                closedMessage.classList.add('hidden');
            }
        } else {
            if (form && form.style.display !== 'none') {
                form.style.display = 'none';
            }
            if (closedMessage && closedMessage.style.display === 'none') {
                closedMessage.style.display = 'block';
                closedMessage.classList.remove('hidden');
            }
            if (closedMessage) {
                const title = closedMessage.querySelector('h2');
                const desc = closedMessage.querySelector('p');
                if (title && desc) {
                    if (hour < 17 || (hour === 17 && minute < 59)) {
                        title.textContent = 'Form Belum Dibuka!';
                        desc.textContent = 'Form akan dibuka pada pukul 17.59 WIB.';
                    } else {
                        title.textContent = 'Form Sudah Ditutup!';
                        desc.textContent = 'Silahkan Chat Contact Person di Bawah!';
                    }
                }
            }
        }
    }

    checkTime();
    setInterval(checkTime, 1000);

    if (!form) return;
    const selects = document.querySelectorAll('.departemen-select');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.querySelector('.submit-btn.primary-btn');

    const section1 = document.getElementById('section-1');
    const section2 = document.getElementById('section-2');
    const section3 = document.getElementById('section-3');
    const submitGroup = document.getElementById('submit-group');

    const next1 = document.getElementById('next-1');
    const next2 = document.getElementById('next-2');
    const back1 = document.getElementById('back-1');
    const back2 = document.getElementById('back-2');

    // Create custom error messages for each field dynamically
    document.querySelectorAll('input, select, textarea').forEach(el => {
        const errDiv = document.createElement('div');
        errDiv.className = 'error-msg';
        errDiv.id = 'err-' + el.id;
        if (el.tagName === 'SELECT') {
            el.parentElement.after(errDiv);
        } else {
            el.after(errDiv);
        }

        // Remove error warning when user types/changes something
        el.addEventListener('input', () => {
            el.classList.remove('invalid');
            errDiv.style.display = 'none';
        });
    });

    // Custom Validation Engine
    function validateSection(section) {
        let isValid = true;
        const fields = section.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            const errDiv = document.getElementById('err-' + field.id);
            if (!field.checkValidity()) {
                isValid = false;
                field.classList.add('invalid');
                errDiv.style.display = 'block';
                
                if (field.validity.valueMissing) {
                    if (field.id === 'kelas' || field.id.startsWith('pilihan')) {
                        errDiv.textContent = 'Harap pilih salah satu opsi.';
                    } else {
                        errDiv.textContent = 'Bagian ini wajib diisi.';
                    }
                } else if (field.validity.patternMismatch) {
                    if (field.id === 'nama') {
                        errDiv.textContent = 'Harus diisi dengan Nama Lengkap Anda (hanya huruf dan spasi).';
                    } else if (field.id === 'nim') {
                        errDiv.textContent = 'Harus diisi dengan 9 angka NIM Anda.';
                    } else {
                        errDiv.textContent = 'Format isian tidak sesuai.';
                    }
                } else {
                    errDiv.textContent = 'Isian tidak valid.';
                }
            } else {
                field.classList.remove('invalid');
                errDiv.style.display = 'none';
            }
        });
        
        return isValid;
    }

    // Function to update available options across all selects
    function updateOptions() {
        const selectedValues = Array.from(selects).map(select => select.value).filter(val => val !== "");

        selects.forEach(select => {
            const currentVal = select.value;
            const options = select.querySelectorAll('option');

            options.forEach(option => {
                if (option.value === "") return; // Abaikan opsi placeholder
                if (selectedValues.includes(option.value) && option.value !== currentVal) {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            });
        });
    }

    // Attach event listeners to all selects
    selects.forEach(select => {
        select.addEventListener('change', updateOptions);
    });

    // Multi-step form logic
    next1.addEventListener('click', () => {
        if (validateSection(section1)) {
            section1.classList.add('hidden');
            section2.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    back1.addEventListener('click', () => {
        section2.classList.add('hidden');
        section1.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    next2.addEventListener('click', () => {
        if (validateSection(section2)) {
            section2.classList.add('hidden');
            section3.classList.remove('hidden');
            submitGroup.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    back2.addEventListener('click', () => {
        section3.classList.add('hidden');
        submitGroup.classList.add('hidden');
        section2.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // URL Web App Google Apps Script Anda (Ganti dengan URL yang Anda dapatkan setelah Deploy)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxEN9y2I4mrQ2qD8Ymf1_EjjyRmz4IaQgZyZdzbeN12moWc4h9G_4o0yYxHCoewkTHB/exec';

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateSection(section3)) {
            return;
        }

        // Extra Validation Check just in case
        const selectedValues = Array.from(selects).map(select => select.value).filter(val => val !== "");
        const hasDuplicates = new Set(selectedValues).size !== selectedValues.length;

        if (hasDuplicates) {
            alert('Terdapat duplikasi pada pilihan departemen. Silakan periksa kembali!');
            return;
        }

        // Animate Button
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Mengambil data form
        const formData = new FormData(form);

        // Network Request ke Google Sheets
        fetch(scriptURL, { method: 'POST', body: new URLSearchParams(formData) })
            .then(response => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                // Sembunyikan form dan tampilkan pesan sukses
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
            })
            .catch(error => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                alert('Terjadi kesalahan koneksi internet. Silakan coba lagi.');
                console.error('Error!', error.message);
            });
    });
});
