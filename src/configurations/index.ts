export default () => ({
  secret_jwt: process.env.SECRET,
  expire_jwt: process.env.EXPIRED_JWT,
});
