import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { RateRoute } from './routes/rates.route';
import { ExchangeRoute } from './routes/exchanges.route';

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new RateRoute(), new ExchangeRoute()]);

app.listen();
