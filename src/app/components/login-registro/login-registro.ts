import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/authService';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login-registro.html',
  styleUrl: './login-registro.css',
})
export class LoginRegistro {
  /*Variables de control de errores*/
  emptyF: boolean = false; //Indica si hay campos vacíos en le registro
  accepTerms: boolean = false; //Indica si el usuario acepto los términos
  disError: boolean = false; //Error cuando no acepta los términos
  errorPassw: boolean = false; //Error cuando las contraseñas no coinciden
  caractPassw: boolean = false; //Error cuando la contraseña no cumple requisitos
  isModalOpen: boolean = false; //Controla la apertura del modal principal
  showLogin: boolean = false; //Controla si se muestra el login o el registro 
  isConfirmModal: boolean = false; //Controla el modal de confirmación

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

  /*Contructor - Inyección de dependencias*/
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) { }

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

  login() {
    /*LLama al servicio de autenticación enviando credenciales*/
    this.authService.login(
      this.loginData.identifier,
      this.loginData.password
    ).subscribe({
      //Si el login es exitoso
      next: () => {

        this.router.navigate(['/registered-home']);
      },
      //Si ocurre un error
      error: err => {
        let message = 'Ocurrió un error inesperado';

        if (err.message === 'Credenciales incorrectas') {
          message = 'Usuario o contraseña incorrectos';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          confirmButtonText: 'Aceptar',
        })
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

    /*LLama al servicio de registro*/
    this.authService.register({
      fullName: this.registerData.fullName.trim(),
      nickName: this.registerData.nickName.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password
    } as any).subscribe({
      //Registro exitoso
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta fue creada correctamente.',
          confirmButtonText: 'Continuar',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: '' // 👈 sin animación al cerrar
          }
        });
        this.showLogin = true;

        this.cd.detectChanges();
      },
      //Error en el registro
      error: err => {
        let message: string = 'Ocurrió un error inesperado';

        if(err.message === 'El usuario ya existe'){
          message = 'El correo o apodo que intentas registrar ya existe'
        }
        Swal.fire({
          icon: 'error',
          title: 'Registro fallido',
          text: message,
          confirmButtonText: 'Entendido'
          }
      );
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

      if (view === 'login') {
        this.showLogin = true;
      }

      if (view === 'register') {
        this.showLogin = false;
      }
    })
  }

  //Cambia entre Login y Registro
  toggleAuth(): void {
    const overlay = document.getElementById("blackOverlay");
    if (!overlay) return;
    const goingToLogin = !this.showLogin;

    //Cambia estado de vista
    this.showLogin = !this.showLogin;

    //Aplica animación correspondiente
    if (goingToLogin) {

      overlay?.classList.add("slide-right");
      overlay?.classList.remove("slide-left", "exit-left", "exit-right");
    } else {

      overlay?.classList.add("slide-left");
      overlay?.classList.remove("slide-right", "exit-left", "exit-right");
    }

    //Maneja transición
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

      overlay!.classList.remove(slideClass);

      const listener = (event: Event) => {
        if ((event as TransitionEvent).propertyName === 'transform') {

          overlay!.classList.remove(exitClass);

          overlay!.classList.remove(slideClass);

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
}