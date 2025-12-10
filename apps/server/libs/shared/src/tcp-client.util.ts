import { ClientProviderOptions, Transport } from '@nestjs/microservices';

type TcpClientConfig = {
  name: string;
  hostEnvKey: string;
  portEnvKey: string;
  defaultHost?: string;
  defaultPort: number;
};

export const createTcpClientOptions = ({
  name,
  hostEnvKey,
  portEnvKey,
  defaultHost = '127.0.0.1',
  defaultPort,
}: TcpClientConfig): ClientProviderOptions => ({
  name,
  transport: Transport.TCP,
  options: {
    host: process.env[hostEnvKey] ?? defaultHost,
    port: Number(process.env[portEnvKey] ?? defaultPort),
  },
});
