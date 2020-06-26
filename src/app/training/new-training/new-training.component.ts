import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  exercises: Exercise[];
  exercisesSubscription: Subscription;
  isLoading = true;

  constructor(private trainingService: TrainingService) { }

  ngOnInit(): void {

    this.exercisesSubscription =  this.trainingService.exercisesChanged.subscribe(
      exercises => {
        this.isLoading = false;
        this.exercises = exercises;
      }
    );
    
    this.trainingService.fetchAvailableExercises();

  }

  ngOnDestroy(): void {
    if (this.exercisesSubscription) {

      this.exercisesSubscription.unsubscribe();
    }
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

}
