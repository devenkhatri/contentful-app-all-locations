import { Skeleton } from '@contentful/f36-components';
import React from 'react';

export const LoadingRecents = () => (
  <Skeleton.Container>
    <Skeleton.BodyText numberOfLines={4} />
  </Skeleton.Container>
);
