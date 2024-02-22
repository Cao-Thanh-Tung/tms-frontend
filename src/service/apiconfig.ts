import { Configuration, ConfigurationParameters } from '@/configuration';
import { UserJwtControllerApiFactory } from '@/api';
// config base path for request
const baseUrl = import.meta.env.VITE_BASE_URL;

const configurationParam: ConfigurationParameters = {
  basePath: baseUrl,
}
const configuration = new Configuration(configurationParam);
  
const authorize = UserJwtControllerApiFactory(configuration).authorize;

export {authorize};