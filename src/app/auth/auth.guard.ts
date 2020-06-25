import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        console.log('can Activate : ', this.authService.isAuth());
        if(this.authService.isAuth() === true) {
            return true;
        } else {
            this.router.navigate(['/login']);
        }


    }


}