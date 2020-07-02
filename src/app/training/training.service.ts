import { Exercise } from './exercise.model';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators/map';
import { UIService } from '../shared/ui.service';

import * as UI from '../shared/ui.actions';
import * as fromTraining from './training.reducer';
import * as Training from './training.actions';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Injectable()
export class TrainingService {

    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore, 
                private uiService: UIService,
                private store: Store<fromTraining.State> ) {}


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
                                    this.store.dispatch(new Training.SetAvailableTrainings(exercises));
                                },
                                error => {
                                    this.store.dispatch(new UI.StopLoading());
                                    this.uiService.showSnackBar('Fecthing exercises failed, pleae try again later', null, 3000);
                                    this.store.dispatch(new Training.SetAvailableTrainings([]));
                                }
                            )
        );

    }

    startExercise(seletedId: string) {
        this.store.dispatch(new Training.StartTraining(seletedId));
    }

    completeExercise() {

        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(
            (exercise: Exercise) => {
                
                this.addDataToDatabase({...exercise, date: new Date(), state: 'completed'});
                this.store.dispatch(new Training.StopTraining());

            }
        )
    }

    cancelExercise(progress: number) {

        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(
            
            (exercise: Exercise) => {
            
                this.addDataToDatabase({
                    ...exercise, 
                    date: new Date(), 
                    state: 'cancelled', 
                    duration: exercise.duration * (progress / 100),
                    calories: exercise.calories * (progress / 100)
                });      
        
                this.store.dispatch(new Training.StopTraining());
            }
        )

    }

    fetchCompletedOrCancelledExercises() {
              
        this.fbSubs.push(this.db.collection('finishedExercices').valueChanges().subscribe(
            (exercises: Exercise[]) => {
                this.store.dispatch(new Training.SetFinishedTrainings(exercises));
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