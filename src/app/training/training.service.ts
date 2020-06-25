
import { Exercise } from './exercise.model';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators/map';

@Injectable()
export class TrainingService {

    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;

    exerciseChange = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore) {}


    fetchAvailableExercises() {

        this.fbSubs.push(this.db.collection('availableExercises')
                            .snapshotChanges()
                            .pipe(
                              map(docArray => {
                                return docArray.map(doc => {
                                  return {
                                    id: doc.payload.doc.id,
                                    ...doc.payload.doc.data() as {}
                                  }
                                })
                              })
                            )
                            .subscribe((exercises: Exercise[]) => {
                                this.availableExercises = exercises;
                                this.exercisesChanged.next([...this.availableExercises]);
                            })
        );

    }

    startExercise(seletedId: string) {
        this.runningExercise = this.availableExercises.find(ex => ex.id === seletedId);
        this.exerciseChange.next({...this.runningExercise}); 
    }

    completeExercise() {
        this.addDataToDatabase({...this.runningExercise, date: new Date(), state: 'completed'});
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise, 
            date: new Date(), 
            state: 'cancelled', 
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100)
        });      
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }

    getRunningExercise() {
        return ({...this.runningExercise});
    }

    fetchCompletedOrCancelledExercises() {
              
        this.fbSubs.push(this.db.collection('finishedExercices').valueChanges().subscribe(
            (exercises: Exercise[]) => {
                this.finishedExercisesChanged.next(exercises);
            })

        );
    }

    cancelSubscriptions() {

        this.fbSubs.forEach(sub => sub.unsubscribe());
    }

    private addDataToDatabase(exercise: Exercise) {

        this.db.collection('finishedExercices').add(exercise)
    }
}