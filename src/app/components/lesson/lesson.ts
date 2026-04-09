import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap, take } from 'rxjs';
import { Nav } from '../../shared/components/nav/nav';
import { FormsModule } from '@angular/forms';
import { UserProgress } from '../../models/progress';
import { ProgressService } from '../../service/progress-service';
import { ModuleService } from '../../service/moduleService';
import { EnergyService } from '../../service/energy-service';
import { SoundService } from '../../service/soundService';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../auth/services/authService';

/*
  Representa una opción de respuesta dentro de un ejercicio.
 */
export interface Option {
  text: string; // Texto que se muestra al usuario
  correct: boolean; // Indica si la opción es correcta
  translation: string;
}

/*
  Representa un ejercicio dentro de una lección.
 */
export interface Exercise {
  id: string; // ID del ejercicio (requerido por el backend)
  question: string;
  questionEs?: string;
  description: string;
  options?: Option[];
  type: 'multiple' | 'order' | 'translate' | 'fill' | 'match';
  exerciseType?: string;
  pairs?: MatchPair[];
  correctAnswer?: string;
  orderIndex?: number;
  hint?: string | null;
}

export interface MatchPair {
  left: string;
  right: string;
}

/*
  Modelo simplificado de una lección utilizada en el componente.
 */
export interface LessonC {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  title: string;
  titleEs?: string;
  xpReward: number;
  energyCost?: number;
  orderIndex?: number;
  lessonType?: string;
  premium?: boolean;
  exercises: Exercise[];
  hasNext?: boolean;
  hasPrevious?: boolean;
  nextLessonId?: string;
  previousLessonId?: string;
}
@Component({
  selector: 'app-lesson',
  imports: [CommonModule, Nav, FormsModule],
  templateUrl: './lesson.html',
  styleUrl: './lesson.css',
})
export class Lesson {

  // Observable que contiene la lección actual
  lesson$!: Observable<LessonC[]>;
  // Índice del ejercicio actual
  currentExerciseIndex = 0;
  // Opción seleccionada por el usuario
  selectedOption: string | null = null;
  // Mensaje de retroalimentación (correcto / incorrecto)
  feedback: string = '';
  // Porcentaje de progreso de la lección
  progressPercent = 0;

  isAnimating = false;

  lastAnswer: string = '';

  feedbackWords: { word: string, status: 'correct' | 'wrong' | 'missing' }[] = [];

  // Estado guardado por ejercicio para poder retroceder sin rehacer
  exerciseStates: {
    selectedOption: string | null;
    selectedWords: (string | null)[];
    wordStates: ('correct' | 'wrong' | 'normal')[];
    matchedPairs: MatchPair[];
    shuffledRight: string[];
    isAnswered: boolean;
    isCorrectAnswer: boolean;
    feedbackWords: { word: string, status: 'correct' | 'wrong' | 'missing' }[];
  }[] = [];

  showVocabRef = false;

  // Control reactivo del índice de ejercicio
  private exerciseIndex$ = new BehaviorSubject<number>(0);

  // Control reactivo del índice de lección
  currentLesson$!: Observable<LessonC>;

  resetStates() {
    this.isAnswered = false;
    this.selectedOption = null;
    this.selectedWords = [];
    this.wordStates = [];
    this.isProcessing = false;
  }

  /*TARJETA DE VOCABULARIO INTRO */
  showVocabIntro = true;


  getVocabFromLesson(lesson: LessonC): { word: string, translation: string }[] {
    const matchExercise = lesson.exercises.find(e => e.type === 'match');
    if (!matchExercise?.pairs?.length) return [];
    return matchExercise.pairs.map(p => ({ word: p.left, translation: p.right }));
  }

  startLesson() {
    this.showVocabIntro = false;
  }

  toggleVocabRef() {
    this.showVocabRef = !this.showVocabRef;
  }

  /*ESTADOS DEL EJERCICIO */
  isAnswered = false; // Indica si el ejercicio ya fue respondido
  isCorrectAnswer = false; // Indica si la respuesta fue correcta
  isProcessing = false; // Evita múltiples envíos simultáneos

  selectedLeft: string | null = null; // Palabra seleccionada del lado izquierdo
  shuffledRight: string[] = []; // Lista mezclada del lado derecho

  matchedPairs: MatchPair[] = []; // Pares correctos encontrados
  wrongPair: MatchPair | null = null; // Par incorrecto temporal
  correctPair: MatchPair | null = null; // Par correcto temporal

  /*SISTEMA DE RACHA */
  currentStreak = 0;
  previousStreak = 0;

  progress: any;

  wordStates: ('correct' | 'wrong' | 'normal')[] = [];

  private lessonIndex$ = new BehaviorSubject<number>(0);
  // luego lo sacas del auth

  private energyService = inject(EnergyService);

  energy$ = this.energyService.energy$;
  constructor(
    private route: ActivatedRoute,
    private router: Router, // Permite acceder a parámetros de la URL
    private lessonService: LessonService, // Servicio para comunicarse con el backend
    private progressService: ProgressService,// Servicio que guarda progreso
    private moduleService: ModuleService,
    private soundService: SoundService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  /* PROGRESO DEL MÓDULO*/
  private moduleProgressSubject = new BehaviorSubject<number>(0);
  moduleProgress$ = this.moduleProgressSubject.asObservable();
  lessonProgress$!: Observable<number>;

  /*ACTUALIZA EL PROGRESO DEL MÓDULO*/
  updateProgress(lesson: LessonC) {
    const total = lesson.exercises.length;
    const progress = ((this.currentExerciseIndex + 1) / total) * 100;

    this.moduleProgressSubject.next(progress);
  }

  /*CONFIRMA RESPUESTA Y AVANZA*/
  confirmAnswer(lesson: LessonC) {

    if (this.currentExerciseIndex < lesson.exercises.length - 1) {
      this.currentExerciseIndex++;
      this.updateProgress(lesson);
    }
  }

  /*
   Se ejecuta al inicializar el componente.
   Obtiene el moduleId desde la URL
   y carga la primera lección del módulo.
  */
  ngOnInit() {
    this.resetLessonState();

    // Cargar lecciones del módulo (shuffle MC options on load)
    this.lesson$ = this.route.paramMap.pipe(
      map(params => params.get('moduleId')!),
      switchMap(moduleId => this.lessonService.getLessonsByModule(moduleId)),
      map(lessons => lessons.map(lesson => ({
        ...lesson,
        exercises: lesson.exercises.map(ex => ({
          ...ex,
          options: (ex.type === 'multiple' || ex.type === 'order') && ex.options
            ? this.shuffleArray([...ex.options])
            : ex.options
        }))
      }))),
      shareReplay(1)
    );

    combineLatest([
      this.lesson$,
      this.route.queryParams
    ]).subscribe(([lessons, params]) => {

      const lessonId = params['lessonId'];

      let index = 0;

      if (lessonId) {
        const foundIndex = lessons.findIndex(l => l.id === lessonId);
        if (foundIndex !== -1) {
          index = foundIndex;
        }
      } else {
        index = this.progress?.completedLessons?.length || 0;
      }

      console.log("LECCIÓN SELECCIONADA:", index);

      this.lessonIndex$.next(index);
    });

    const user = this.authService.getCurrentUser();

    // Cargar progreso si hay usuario
    if (user) {
      this.progressService.getProgress(user.userId).subscribe();
    }

    this.progressService.progress$.subscribe(p => {
      this.progress = p;
    });

    this.lesson$.pipe(take(1)).subscribe(lessons => {

      const params = this.route.snapshot.queryParams;
      const lessonId = params['lessonId'];

      // SI YA VIENE UNA LECCIÓN → NO TOCAR
      if (lessonId) return;

      const user = this.authService.getCurrentUser();

      // Invitado o sin progreso → empieza desde la primera
      if (!user || !this.progress?.completedLessons) {
        this.lessonIndex$.next(0);
        return;
      }

      // Buscar siguiente lección no completada
      const nextIndex = lessons.findIndex(lesson =>
        !this.progress.completedLessons.includes(lesson.id)
      );

      // Si encontró → va a esa, si no → vuelve a la primera
      this.lessonIndex$.next(nextIndex !== -1 ? nextIndex : 0);

    });

    /* Obtiene la lección actual combinando
       las lecciones y el índice actual */
    this.currentLesson$ = combineLatest([
      this.lesson$,
      this.lessonIndex$
    ]).pipe(
      map(([lessons, index]) => lessons[index])
    );

    this.lessonProgress$ = combineLatest([
      this.currentLesson$,
      this.exerciseIndex$
    ]).pipe(
      map(([lesson, exerciseIndex]) => {

        if (!lesson) return 0;

        const total = lesson.exercises.length;

        return (exerciseIndex / total) * 100;
      })
    );

    /* Calcula el progreso total del módulo
       teniendo en cuenta todos los ejercicios */
    this.moduleProgress$ = combineLatest([
      this.lesson$,
      this.lessonIndex$,
      this.exerciseIndex$
    ]).pipe(
      map(([lessons, lessonIndex, exerciseIndex]) => {

        if (!lessons.length) return 0;

        // Total de ejercicios del módulo
        const totalExercises = lessons.reduce(
          (acc, lesson) => acc + lesson.exercises.length,
          0
        );

        // Ejercicios completados hasta la lección actual
        let completedExercises = 0;

        for (let i = 0; i < lessonIndex; i++) {
          completedExercises += lessons[i].exercises.length;
        }

        // Sumamos el ejercicio actual dentro de la lección
        completedExercises += exerciseIndex;

        return (completedExercises / totalExercises) * 100;
      })
    );

    /* Inicializa ejercicios tipo match */
    this.currentLesson$.subscribe(lesson => {

      const currentExercise = this.getCurrentExercise(lesson);

      if (currentExercise?.type === 'match' && currentExercise.pairs) {
        this.shuffledRight = this.shuffleArray(
          currentExercise.pairs.map(p => p.right)
        );
      }
    });
  }
  /*
   Guarda la opción seleccionada por el usuario.
   Si cambia de opción después de una respuesta incorrecta, limpia el estado.
  */
  selectOption(option: string) {
    if (this.selectedOption !== option && this.isAnswered && !this.isCorrectAnswer) {
      this.isAnswered = false;
      this.isCorrectAnswer = false;
    }
    this.selectedOption = option;
  }

  /*
    Envía la respuesta al backend para validación.
    Muestra retroalimentación según el resultado.
   */
  submitAnswer(lesson: LessonC) {

    // Al volver a un ejercicio ya completado, solo avanzar sin gastar energía ni ir al backend
    if (this.isAnswered && this.isCorrectAnswer) {
      this.nextExercise(lesson, true);
      return;
    }

    if (this.isProcessing) return;
    this.isProcessing = true;

    const exercise = this.getCurrentExercise(lesson);
    if (!exercise) {
      this.isProcessing = false;
      return;
    }

    // 🔥 MATCH (NO pasa por backend)
    if (exercise.type === 'match' && exercise.pairs) {
      this.handleMatch(lesson);
      return;
    }

    const answer = this.buildAnswer(exercise);

    if (answer === null) {
      this.isProcessing = false;
      return;
    }

    this.lessonService
      .submitAnswer(lesson.id, exercise.id, answer)
      .subscribe({
        next: (res) => {
          if (res.correctAnswer) exercise.correctAnswer = res.correctAnswer;
          this.handleResponse(res.correct, lesson, exercise);
        },
        error: () => this.isProcessing = false
      });
  }

  // Construye la respuesta del usuario según el tipo de ejercicio
  // Devuelve un string con la respuesta o null si no hay respuesta válida
  buildAnswer(exercise: Exercise): string | null {

    switch (exercise.type) {

      // Ejercicio de opción múltiple
      case 'multiple':
        return this.selectedOption || null;

      // Ejercicio de ordenar palabras
      // Une las palabras seleccionadas en un solo string separado por espacios
      case 'order':
        return this.selectedWords?.length
          ? this.selectedWords.join(' ')
          : null;

      // Ejercicio de traducir o completar
      // Elimina espacios al inicio y final
      case 'translate':
      case 'fill':
        return this.selectedOption?.trim() || null;

      default:
        return '';
    }
  }

  // Maneja la respuesta después de validar si es correcta o incorrecta
  handleResponse(res: boolean, lesson: LessonC, exercise: Exercise) {

    this.isAnswered = true;
    this.isCorrectAnswer = res;

    // Marca visualmente la opción correcta seleccionada
    if (res && exercise.options) {
      const selected = exercise.options.find(o => o.text === this.selectedOption);
      if (selected) selected.correct = true;
    }

    if (exercise.type === 'order') {
      this.evaluateOrder(exercise);
    }

    //  SOLO PARA TRANSLATE
    if (exercise.type === 'translate') {
      this.checkTranslationFromText(exercise);
    }

    this.cdr.detectChanges(); // Fuerza actualización de la vista

    if (res) {

      // Si es correcta, avanza después de 800ms
      setTimeout(() => {
        this.nextExercise(lesson);
        this.resetStates();
      }, 800);

    } else {
      // Si es incorrecta, reproduce sonido de error
      this.soundService.playError(); //  sonido centralizado
      this.isProcessing = false; // Permite volver a intentar
    }

  }

  getFillParts(text: string): string[] {
    return text.split(/_{2,}/);
  }

  onUserTyping() {

    if (this.selectedOption === this.lastAnswer) return;

    this.isAnswered = false;
    this.feedbackWords = [];
  }

  evaluateOrder(exercise: Exercise) {

    if (!exercise || exercise.type !== 'order') return;

    const correct = (exercise as any).correctOrder ?? exercise.correctAnswer?.split(' ');
    if (!correct) return;

    this.wordStates = (this.selectedWords ?? []).map((word, i) => {

      if (!word) return 'normal';

      return word.trim().toLowerCase() === correct[i]?.trim().toLowerCase()
        ? 'correct'
        : 'wrong';
    });
  }

  checkTranslationFromText(exercise: any) {

    const correctText = exercise.correctAnswer || '';

    const userWords = (this.selectedOption || '')
      .trim()
      .split(/\s+/);

    const correctWords = correctText
      .trim()
      .split(/\s+/);

    this.feedbackWords = [];

    const maxLength = Math.max(userWords.length, correctWords.length);

    for (let i = 0; i < maxLength; i++) {

      const user = userWords[i];
      const correct = correctWords[i];

      if (!user && correct) {
        this.feedbackWords.push({
          word: correct,
          status: 'missing'
        });
      } else if (user && correct && user.toLowerCase() === correct.toLowerCase()) {
        this.feedbackWords.push({
          word: user,
          status: 'correct'
        });
      } else if (user) {
        this.feedbackWords.push({
          word: user,
          status: 'wrong'
        });
      }
    }
  }

  // Maneja la lógica cuando un ejercicio tipo "match" es correcto
  handleMatch(lesson: LessonC) {

    // Verifica si es el último ejercicio de la lección
    const isLast = this.currentExerciseIndex === lesson.exercises.length - 1;

    if (isLast) {
      //this.soundService.playNotification(); // 🎉 final correcto

      // Marca progreso y finaliza la lección
      this.exerciseIndex$.next(this.currentExerciseIndex + 1);
      this.finishLesson(lesson);

    } else {
      // Si no es el último, pasa al siguiente
      this.nextExercise(lesson);
    }
  }
  /* Mezcla un arreglo aleatoriamente */
  shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  selectLeft(word: string) {
    this.selectedLeft = word;
  }

  /*
 Controla la selección del lado derecho
 y valida si el par es correcto.
*/
  selectRight(word: string, lesson: LessonC) {

    if (!this.selectedLeft) return;

    const currentExercise = this.getCurrentExercise(lesson);
    if (!currentExercise || !currentExercise.pairs) return;

    const correctPair = currentExercise.pairs.find(
      p => p.left === this.selectedLeft
    );

    if (correctPair?.right === word) {

      // ✅ CORRECTO
      const pair = {
        left: this.selectedLeft,
        right: word
      };

      this.correctPair = pair; // 👈 activar verde

      this.matchedPairs.push(pair);

      setTimeout(() => {
        this.correctPair = null;
      }, 500);


      // 🔥 EL CAMBIO IMPORTANTE

      if (this.matchedPairs.length === currentExercise.pairs.length) {
        this.isAnswered = true;
      }
    } else {

      // ❌ INCORRECTO
      this.wrongPair = {
        left: this.selectedLeft,
        right: word
      };

      setTimeout(() => {
        this.wrongPair = null;
      }, 800);
    }

    this.selectedLeft = null;
  }

  /*CONTROL DE ESTADOS MATCH*/
  isLeftDisabled(left: string): boolean {
    return this.matchedPairs.some(m => m.left === left);
  }

  isRightDisabled(right: string): boolean {
    return this.matchedPairs.some(m => m.right === right);
  }

  isWrongLeft(word: string): boolean {
    return !!this.wrongPair && this.wrongPair.left === word;
  }

  isWrongRight(word: string): boolean {
    return !!this.wrongPair && this.wrongPair.right === word;
  }

  /*Retrocede al ejercicio anterior restaurando su estado completado*/
  previousExercise() {
    if (this.currentExerciseIndex <= 0) return;

    this.currentExerciseIndex--;
    this.exerciseIndex$.next(this.currentExerciseIndex);

    const saved = this.exerciseStates[this.currentExerciseIndex];
    if (saved) {
      this.selectedOption = saved.selectedOption;
      this.selectedWords = [...saved.selectedWords];
      this.wordStates = [...saved.wordStates];
      this.matchedPairs = [...saved.matchedPairs];
      this.shuffledRight = [...saved.shuffledRight];
      this.isAnswered = saved.isAnswered;
      this.isCorrectAnswer = saved.isCorrectAnswer;
      this.feedbackWords = [...saved.feedbackWords];
    } else {
      this.isAnswered = false;
      this.isCorrectAnswer = false;
      this.selectedOption = null;
      this.selectedWords = [];
      this.wordStates = [];
      this.matchedPairs = [];
      this.feedbackWords = [];
    }
    this.isProcessing = false;
    this.wrongPair = null;
    this.selectedLeft = null;
    this.feedback = '';
  }

  /*Controla los estados de los ejercicios*/
  nextExercise(lesson: LessonC, skipEnergy = false) {
    // Guarda el estado del ejercicio actual antes de avanzar
    this.exerciseStates[this.currentExerciseIndex] = {
      selectedOption: this.selectedOption,
      selectedWords: [...(this.selectedWords || [])],
      wordStates: [...this.wordStates],
      matchedPairs: [...this.matchedPairs],
      shuffledRight: [...this.shuffledRight],
      isAnswered: this.isAnswered,
      isCorrectAnswer: this.isCorrectAnswer,
      feedbackWords: [...this.feedbackWords],
    };

    // 🔒 BLOQUEO DE ENERGÍA (no aplica al re-avanzar ejercicios ya completados)
    if (!skipEnergy && !this.energyService.canPlay()) {
      alert('Sin energía 😢');
      return;
    }

    // CONSUMIR ENERGÍA
    if (!skipEnergy) {
      const used = this.energyService.useEnergy();
      if (!used) return;
    }

    const total = lesson.exercises.length;

    this.isAnswered = false;
    this.isCorrectAnswer = false;
    this.isProcessing = false;

    if (this.currentExerciseIndex < total - 1) {

      this.currentExerciseIndex++;
      this.exerciseIndex$.next(this.currentExerciseIndex);
      this.selectedOption = null;
      this.feedback = '';
      this.matchedPairs = [];

      const currentExercise = this.getCurrentExercise(lesson);
      if (currentExercise?.type === 'match' && currentExercise.pairs) {
        this.shuffledRight = this.shuffleArray(
          currentExercise.pairs.map(p => p.right)
        );
      }

    } else {
      this.finishLesson(lesson);
    }
  }

  /*Finaliza las lecciones*/
  finishLesson(lesson: LessonC) {
    const user = this.authService.getCurrentUser();
    const alreadyCompleted = this.progress?.completedLessons?.includes(lesson.id) ?? false;

    this.soundService.playSuccess();
    this.moduleService.completeLesson();

    // Guest: guardar lección completada en localStorage
    if (!user) {
      const stored = JSON.parse(localStorage.getItem('guestCompletedLessons') || '[]');
      if (!stored.includes(lesson.id)) {
        stored.push(lesson.id);
        localStorage.setItem('guestCompletedLessons', JSON.stringify(stored));
      }
      setTimeout(() => this.router.navigate(['/module-view']), 800);
      return;
    }

    // Si la lección ya fue completada, no otorgar XP nuevamente
    if (alreadyCompleted) {
      setTimeout(() => this.router.navigate(['/module-view']), 800);
      return;
    }

    this.progressService
      .completeLesson(lesson.id, lesson.xpReward)
      .subscribe(progress => {
        if (user && progress) {
          this.handleStreak(progress);
        }
        setTimeout(() => this.router.navigate(['/module-view']), 800);
      });
  }

  /* Maneja actualización de racha */
  handleStreak(progress: UserProgress) {

    this.currentStreak = progress.currentStreak;

    if (this.currentStreak > this.previousStreak) {
      this.showStreakAnimation();
    }
  }

  goToNextLesson() {

    this.currentExerciseIndex = 0;
    this.exerciseIndex$.next(0);
    this.selectedOption = null;
    this.feedback = '';

    this.nextLesson(); //  solo si nextLesson SOLO cambia la lección
  }

  /* Animación de racha */
  showStreakAnimation() {
    console.log(`¡Racha de ${this.currentStreak} día!`);
  }

  /*
    Avanza al siguiente ejercicio y actualiza el progreso.
   */
  nextLesson() {

    const currentIndex = this.lessonIndex$.value;

    this.lesson$.pipe(take(1)).subscribe(lessons => {

      if (currentIndex < lessons.length - 1) {

        this.lessonIndex$.next(currentIndex + 1);

        this.currentExerciseIndex = 0;
        this.exerciseIndex$.next(0);
        this.selectedOption = null;
        this.feedback = '';
        this.isProcessing = false;

        this.resetLessonState();

      } else {
        this.feedback = "🎉 Módulo completado";
      }

    }).unsubscribe();
  }

  // Palabras seleccionadas en ejercicio tipo "order"
  selectedWords: (string | null)[] = [];

  // Agrega una palabra si aún no está seleccionada
  addWord(word: string) {
    if ((this.selectedWords ?? []).includes(word)) return;

    const emptyIndex = (this.selectedWords ?? []).findIndex(w => w === null);

    if (emptyIndex !== -1) {
      this.selectedWords[emptyIndex] = word;
    } else {
      this.selectedWords.push(word);
    }
  }

  // Elimina una palabra seleccionada
  removeWord(index: number) {
    // 🔒 SI ES CORRECTA → NO SE PUEDE QUITAR
    if (this.wordStates[index] === 'correct') return;

    this.selectedWords[index] = null;
    this.wordStates[index] = 'normal';
  }

  /* Reinicia el estado del ejercicio */
  resetLessonState() {
    this.showVocabIntro = true;
    this.showVocabRef = false;
    this.exerciseStates = [];
    this.currentExerciseIndex = 0;
    this.exerciseIndex$.next(0);

    this.selectedOption = null;
    this.selectedWords = [];
    this.matchedPairs = [];
    this.wrongPair = null;
    this.selectedLeft = null;

    this.isAnswered = false;
    this.isCorrectAnswer = false;
    this.isProcessing = false;

    this.feedback = '';
  }

  /*
    Retorna el ejercicio actual según el índice.
   */
  getCurrentExercise(lesson: LessonC): Exercise | null {
    return lesson.exercises?.[this.currentExerciseIndex] ?? null;
  }

  // Escucha la tecla ENTER en todo el documento
  @HostListener('document:keydown.enter')
  handleEnter() {

    // Evita múltiples envíos simultáneos
    if (this.isProcessing) return;

     (document.activeElement as HTMLElement)?.blur();

    // bloqueo por energía
    if (!this.energyService.canPlay()) {
      this.feedback = "⚡ Te quedaste sin energía";
      return;
    }

    this.currentLesson$.pipe(take(1)).subscribe(lesson => {

      // Si ya respondió, avanza
      if (!lesson) return;

      // SOLO AVANZA SI YA ES CORRECTA
      if (this.isAnswered && this.isCorrectAnswer) {
        this.nextExercise(lesson);
        return;
      }

      // SI NO HA RESPONDIDO O FALLÓ → INTENTA
      this.submitAnswer(lesson)

    });
  }

  // Navega a una lección verificando permisos y progreso
  goToLesson(lessonId: string, lessons: any) {
    const user = this.authService.getCurrentUser();

    // CASO 1: INVITADO
    if (!user) {
      if (lessonId !== lessons[0].id) {
        this.router.navigate(['/register']);
        return;
      }

      // puede entrar a la primera lección
      this.router.navigate(['/lesson', lessonId]);
      return;
    }

    // CASO 2: USUARIO REGISTRADO

    const index = lessons.findIndex((l: LessonC) => l.id === lessonId);

    if (index === 0) {
      this.router.navigate(['/lesson', lessonId]);
      return;
    }

    const previousLesson = lessons[index - 1];

    // Si no ha completado la lección anterior, está bloqueada
    if (!this.progress?.completedLessons?.includes(previousLesson.id)) {
      return; // bloqueado
    }

    this.router.navigate(['/lesson', lessonId]);
  }

  // Determina si una lección está desbloqueada según el progreso
  isLessonUnlocked(lessonId: string, lessons: any[]): boolean {

    const index = lessons.findIndex(l => l.id === lessonId);

    // La primera siempre está desbloqueada
    if (index === 0) return true;

    const previousLesson = lessons[index - 1];

    // Está desbloqueada si la lección anterior fue completada
    return this.progress?.completedLessons?.includes(previousLesson.id);
  }
}
