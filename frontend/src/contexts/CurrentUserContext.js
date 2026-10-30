import { createContext } from 'react';

// O valor é fornecido pelo App: { currentUser, handleUpdateUser,
// handleUpdateAvatar, isLoading }. Quem assina com useContext pega só o que
// precisa.
const CurrentUserContext = createContext();

export default CurrentUserContext;
