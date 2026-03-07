import React, { createContext, useContext } from 'react';

export type InterfaceMode = 'standard' | 'friendly';

export const InterfaceContext = createContext<InterfaceMode>('friendly');

export const useInterface = () => useContext(InterfaceContext);
