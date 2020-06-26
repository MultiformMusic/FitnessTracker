import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({

    declarations: [
        LoginComponent,
        SignupComponent
    ],
    imports: [
        AuthRoutingModule,
        SharedModule,
        ReactiveFormsModule,
        AngularFireAuthModule
    ],
    exports: [

    ]
    
})
export class AuthModule {

}