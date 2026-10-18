const webpush = {
  setVapidDetails: (_subject: string, _publicKey: string, _privateKey: string) => {},
  sendNotification: async (_sub: unknown, _payload?: string, _opts?: unknown) => ({
    statusCode: 201,
    body: "",
    headers: {},
  }),
};

export default webpush;
export const setVapidDetails = webpush.setVapidDetails;
export const sendNotification = webpush.sendNotification;
