import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export default class HelperService {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
    }

}
