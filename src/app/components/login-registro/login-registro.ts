import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/authService';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login-registro.html',
  styleUrl: './login-registro.css',
})
export class LoginRegistro {
  /*Variables de control de errores*/
  emptyF: boolean = false;
  loginEmptyF: boolean = false;
  loginShortPass: boolean = false;
  accepTerms: boolean = false;
  disError: boolean = false;
  errorPassw: boolean = false;
  caractPassw: boolean = false;
  isModalOpen: boolean = false;
  showLogin: boolean = false;
  isConfirmModal: boolean = false;
  forgotPasswordEmail: string = '';
  // Control visibilidad contraseñas
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  /*Contructor - Inyección de dependencias*/
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private location: Location
  ) { }

  @ViewChild('name') nameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailNickname') loginInput?: ElementRef<HTMLInputElement>;

  setFocus(view: 'login' | 'register') {
    setTimeout(() => {
      const inputToFocus = view === 'register'
        ? this.nameInput?.nativeElement
        : this.loginInput?.nativeElement;

      if (inputToFocus) {
        // Limpiamos cualquier foco previo
        (document.activeElement as HTMLElement)?.blur();

        // Enfocamos el elemento específico
        inputToFocus.focus({ preventScroll: true });
      }
    }, 50); // Un delay de 50ms suele ser más seguro para cambios de ruta/vistas
  }

  /*Datos del formulario Login*/
  loginData = {
    identifier: '',
    password: ''
  };

  /*Datos del formulario Registro*/
  registerData = {
    fullName: '',
    nickName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  //Login de Usuario
  /*login() {
  /*Llama al servicio de autenticación enviando el identificador (email o nickname), y la contraseña ingresados por el usuario
    const success = this.authService.login(
      this.loginData.identifier,
      this.loginData.password
    ).subscribe({
    //Se ejecutan cuando el login es exitoso
      next:(res)=>{
      //Redirige al usuario a la vista principal de usuario registrado
        this.router.navigate(['/registered-home']);
      },
      //Se ejecuta si ocurre un error durante el login
      error: (err) => {
      //Muestra el error en consola para depuración
        console.error('Error login:', err);
        /Muestra un mensaje al usuario
        //Si el backend envía un mensaje, lo usa; de lo contrario muestra uno por defecto
        alert('Error en el login: ' + (err.error?.message || 'Credenciales incorrectas'));
      }
    });
  }*/

  //Inicia sesión con el identificador (correo o usuario) y contraseña
  login() {
    this.loginEmptyF = !this.loginData.identifier?.trim() || !this.loginData.password;
    this.loginShortPass = this.loginData.password.length > 0 && this.loginData.password.length < 8;

    if (this.loginEmptyF || this.loginShortPass) return;
    //Llama al servicio de autenticación
    this.authService.login(this.loginData.identifier, this.loginData.password).subscribe({
      //Si el login es exitoso, redirige al home del usuario registrado
      next: () => {
        this.router.navigate(['/registered-home']);
      },
      //Si ocurre un error, muestra el mensaje correspondiente
      error: err => {
        const code = err.error?.code;
        let message = err.error?.message || 'Ocurrió un error inesperado';

        //Verifica si el correo no ha sido confirmado
        if (code === 'EMAIL_NOT_VERIFIED') {
          message = 'Debes verificar tu correo electrónico antes de iniciar sesión.';
          //Verifica si las credenciales son incorrectas
        } else if (code === 'INVALID_CREDENTIALS' || err.status === 401) {
          message = 'Usuario o contraseña incorrectos.';
          //Verifica si la cuenta esta bloqueada
        } else if (code === 'ACCOUNT_LOCKED') {
          message = 'Tu cuenta está bloqueada. Intenta más tarde.';
        }

        //Muestra alerta con el error
        Swal.fire({ icon: 'error', title: 'Error al iniciar sesión', text: message, confirmButtonText: 'Aceptar' });
      }
    });
  }

  /*
  //Verifica si el login fue exitoso
    if (success) {
    //Si el login es correcto, redirige al usuario a la vista principal donde prodrá acceder al contenido como usuario autenticado
      this.router.navigate(['/registered-home']);
    } else {
      
    //Si el login falla, muestra un mensaje informando al usuario que las credenciales ingresadas no son válidas
      alert('Credenciales incorrectas');
    }
  }

*/
  /*register() {
  //Expresión para validar contraseña
    //mínimo 9 caracteres, 1 mayúscula y 1 número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    //Valida que la contraseña contenga los caracteres adecuados.
    this.caractPassw = !passRegex.test(this.registerData.password);

    //Valida si hay campos vacíos
    this.emptyF = this.fieldsEmpty();

    //Valida si el usuario acepto los términos, de lo contrario no deja registrar
    this.disError = !this.accepTerms;

    //Si hay algún error detiene el registro y muestra mensaje al usuario
    if (this.emptyF || this.disError || this.errorPassw || this.caractPassw) {
      return;
    }

  const payload = {
  //Crea el objeto que se enviará al backend con la información del usuario.
  //Se usa trim() para eliminar espacios en blanco al inicio y al final, evitando errores o registros con datos incorrectos.
    full_name: this.registerData.fullName.trim(),
    nickname: this.registerData.nickName.trim(),
    email: this.registerData.email.trim(),
    password: this.registerData.password
  };

  //Llama al servicio de autenticación para registrar el nuevo usuario, enviando los datos dentro del objeto payload
  const success = this.authService.register(payload as any).subscribe({
  //Se ejecuta cuando el registro se completa correctamente
  next: () => {
  //Muestra un mensaje informando al usuario que el registro fue exitoso.
    alert('Registro exitoso. Por favor inicia sesión.');
    //Redirige al usuario a la vista de Login, y envía el parámetro "view=login" para mostrar el formulario de inicio de sesión
    this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } });
  },
  //Se ejecuta si ocurre un error durante el registro
  error: err => {
  //Muestra el error en consola para facilitar la depuración
    console.error('Error registro:', err);
    //Muestra un mensaje al usuario.
    //Si el servidor envía un mensaje especifíco, lo muestra, de lo contrario, muestra un mensaje genérico.
    alert('Error en el registro: ' + (err.error?.message || 'Error desconocido'));
  }
});
};*/

  /*
  //Verifica si el registro fue exitoso
      if (success) {
      //Si el usuario se registró correctamente, muestra un mensaje de confirmación
        alert('Registro exitoso');
        //Cambia la vista para mostrar el formulario de Login y permitir que el usuario inicie sesión
        this.showLogin = true;
      } else {
        //Si el registro falla, por ejemplo, si el usuario ya existe, muestra un mensaje informando el problema
        alert('El usuario ya existe');
      }
    }
  */

  //Registro de Usuario
  register() {
    //Expresión para validar contraseña
    //mínimo 9 caracteres, 1 mayúscula y 1 número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    //Valida que la contraseña contenga los caracteres adecuados.
    this.caractPassw = !passRegex.test(this.registerData.password);

    //Valida si hay campos vacíos
    this.emptyF = this.fieldsEmpty();

    //Valida si el usuario acepto los términos, de lo contrario no deja registrar
    this.disError = !this.accepTerms;

    //Si hay algún error detiene el registro y muestra mensaje al usuario
    if (this.emptyF || this.disError || this.errorPassw || this.caractPassw) {
      return;
    }

    this.authService.register({
      fullName: this.registerData.fullName.trim(),
      nickname: this.registerData.nickName.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password,
      confirmPassword: this.registerData.confirmPassword
    }).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.',
          confirmButtonText: 'Ir al login'
        });
        
        this.registerData = { fullName: '', nickName: '', email: '', password: '', confirmPassword: '' };
        this.accepTerms = false;
        this.emptyF = false;
        this.errorPassw = false;

       setTimeout(() => {
    this.showLogin = true;

    const overlay = document.getElementById("blackOverlay");
    const panelLogin = document.getElementById("panelLogin");
    const panelRegister = document.getElementById("panelRegister");

    if (overlay && panelLogin && panelRegister) {
      // Forzamos al overlay a desaparecer instantáneamente (sin transición)
      overlay.style.transition = 'none'; 
      overlay.className = ''; 
      overlay.classList.add('exit-right');

      // Posicionamos los paneles en su estado de "Login Activo"
      panelLogin.classList.remove('inactive');
      panelLogin.classList.add('active');
      panelRegister.classList.remove('active');
      panelRegister.classList.add('inactive');

      // Devolvemos la transición al overlay para futuros clics manuales
      setTimeout(() => {
        overlay.style.transition = 'transform 0.6s cubic-bezier(.4, 0, .2, 1)';
      }, 50);
    }

    this.cd.detectChanges();
    this.setFocus('login');
  }, 100);
  
      },
      error: err => {
        const code = err.error?.code;
        let message = err.error?.message || 'Ocurrió un error inesperado';

        if (code === 'EMAIL_ALREADY_EXISTS' || err.status === 409) {
          message = 'El correo o apodo que intentas registrar ya existe.';
        }

        Swal.fire({ icon: 'error', title: 'Registro fallido', text: message, confirmButtonText: 'Entendido' });
      }
    });
  }

  //Valida si hay campos vacíos
  fieldsEmpty() {
    return (
      !this.registerData.fullName?.trim() ||
      !this.registerData.nickName?.trim() ||
      !this.registerData.email?.trim() ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    );
  }

  //Valida si las contraseñas coinciden
  passwordValidation(password: string, confirmPassword: string) {
    //Si hay algún error detiene el registro y muestra mensaje al usuario
    if (!password && !confirmPassword) {
      this.errorPassw = false;
      return;
    }

    //Valida que las contraseñas ingresadas coincidan
    this.errorPassw = password !== confirmPassword;
  }

  //Valida si la contraseña cumple con la cantidad de caracteres solicitados
  caracterPassword(password: string) {
    //Expresión para validar contraseña
    //mínimo 9 caracteres, 1 mayúscula y 1 número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    //Valida que la contraseña contenga los caracteres adecuados.
    this.caractPassw = !passRegex.test(password);
  }

  //Inicializa componente
  ngOnInit() {
    //Lee parámetros de la URL para decidir qué vista mostrar
    this.route.queryParams.subscribe(params => {
      const view = params['view'];
      this.showLogin = (view === 'login');

      // Esperamos a que el DOM se estabilice tras el cambio de showLogin
      setTimeout(() => {
        this.setFocus(this.showLogin ? 'login' : 'register');
      }, 100);
    });
  }

  //Cambia entre Login y Registro
  toggleAuth(): void {
    const overlay = document.getElementById("blackOverlay");
    //Si no existe no hace nada
    if (!overlay) return;
    //Verifica hacia que vista se va a cambiar
    const goingToLogin = !this.showLogin;

    //Cambia estado de vista
    this.showLogin = !this.showLogin;

    //Aplica animación al cambiar de vista
    if (goingToLogin) {

      //Si va hacia login, se mueve a la derecha
      overlay?.classList.add("slide-right");
      overlay?.classList.remove("slide-left", "exit-left", "exit-right");
    } else {
      //Si va hacia registro, se mueve a la izquierda
      overlay?.classList.add("slide-left");
      overlay?.classList.remove("slide-right", "exit-left", "exit-right");
    }

    //Maneja la transición
    setTimeout(() => {
      let exitClass: string;
      let slideClass: string;

      if (goingToLogin) {
        slideClass = "slide-right";
        exitClass = "exit-right";
      } else {
        slideClass = "slide-left";
        exitClass = "exit-left";
      }

      //Quita la clase inicial de moviento 
      overlay!.classList.remove(slideClass);

      //Escucha cuando la animación termina
      const listener = (event: Event) => {
        //Solo actúa cuando termina la transición del transform
        if ((event as TransitionEvent).propertyName === 'transform') {
          //Limpia las clases usadas en la animación
          overlay!.classList.remove(exitClass);
          overlay!.classList.remove(slideClass);

          // Se llama al foco cuando el overlay ya terminó de moverse 
          // y no está bloqueando visualmente los inputs.
          this.setFocus(goingToLogin ? 'login' : 'register');

          //Elimina el listener para evitar que se repita
          overlay!.removeEventListener('transitionend', listener);
        }
      };

      overlay!.addEventListener('transitionend', listener);
    }, 600);
  }

  //Modales
  //Abre modal principal
  openModal() {
    this.isModalOpen = true;
  }

  //Cierra modales
  closeModal() {
    this.isModalOpen = false;
    this.isConfirmModal = false;
  }

  //Cierra modal si se hace click fuera
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  //Cierra modal de confirmación
  closeConfirmModal() {
    this.isConfirmModal = false;
  }

  //Abre modal de confirmación
  openConfirmModal() {
    this.isModalOpen = false;
    this.isConfirmModal = true;
  }

  //Navega a nueva contraseña
  goNewPassword() {
    this.closeConfirmModal();
    this.router.navigate(['/new-password'])
  }

  // Inicia sesión con GitHub - OAuth2
  loginWithGithub() {
    this.http.get<{ data: string }>(`${environment.apiUrl}/auth/oauth2/github`).subscribe({
      next: res => window.location.href = res.data,
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con GitHub.' })
    });
  }

  // Inicia sesión con Google
  loginWithGoogle() {
    this.http.get<{ data: string }>(`${environment.apiUrl}/auth/oauth2/google`).subscribe({
      next: res => window.location.href = res.data,
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con Google.' })
    });
  }

  // Forgot password — envía email con link de reset
  sendForgotPassword() {
    if (!this.forgotPasswordEmail.trim()) return;

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.forgotPasswordEmail }).subscribe({
      next: () => {
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
          confirmButtonText: 'Aceptar'
        });
      },
      error: () => {
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  // Regresa a la página anterior
  goBack() {
    this.location.back();
  }

  // Alternar visibilidad contraseña
  togglePassword(): void {
    console.log("click funcionando");
    this.showPassword = !this.showPassword;
  }

  // Alternar visibilidad confirmar contraseña
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}