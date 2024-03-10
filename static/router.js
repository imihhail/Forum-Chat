import { home } from './home.js';
import { registration, CheckSession } from './register.js';
import { login } from './login.js';

export function router(route, username = null){
    document.getElementById('app').innerHTML = '';
    
    switch(route) {
        case '/':
            CheckSession()
            break;
        case '/home':
            home(username);
            break;
        case '/register':
            registration();
            break;
        case '/login':
            login();
            break;
        default:
            CheckSession();
    }
}
