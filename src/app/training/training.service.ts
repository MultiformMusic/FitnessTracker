
import { Exercise } from './exercise.model';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators/map';
import { UIService } from '../shared/ui.service';

import * as UI from '../shared/ui.actions';
import * as fromRoot from '../app.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class TrainingService {

    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;

    exerciseChange = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore, 
                private uiService: UIService,
                private store: Store<fromRoot.State> ) {}


    fetchAvailableExercises() {

        this.store.dispatch(new UI.StartLoading());

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
                            .subscribe(
                                (exercises: Exercise[]) => {
                                this.store.dispatch(new UI.StopLoading());
                                this.availableExercises = exercises;
                                this.exercisesChanged.next([...this.availableExercises]);
                                },
                                error => {
                                    this.store.dispatch(new UI.StopLoading());
                                    this.uiService.showSnackBar('Fecthing exercises failed, pleae try again later', null, 3000);
                                    this.exercisesChanged.next(null);
                                }
                            )
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