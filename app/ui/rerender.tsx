import { Fragment, type Key, type ReactElement, type ReactNode } from 'react';

export interface ForceRerenderProps {
  readonly key: Key;
  readonly children: ReactNode;
}

export const ForceRerender = ({
  key,
  children,
}: ForceRerenderProps): ReactElement => (
  <Fragment key={key}>{children}</Fragment>
);
