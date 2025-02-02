import httpService, { endpoints } from "./httpService";
import { chatDispatch } from "../store/chatsSlice";
import Chat from "../types/chat";
import store from "../store";
import userService from "./userService";

const { comments: commentEndpoint } = endpoints;

const getChats = async () => {
	try {
		const result = await httpService.get(commentEndpoint);
		const data = result.data.data ?? [];
		chatDispatch.set(data);
	} catch (e) {
		console.log(e.message);
	}
};

const addChat = async (chat: Chat) => {
	const newChat: any = { ...chat };
	delete newChat.id;

	chatDispatch.addChat({ ...chat, notSent: true });

	try {
		const { name, id: userId, avatar } = await userService.getCurrentUser();

		await httpService.post(
			commentEndpoint,
			{ ...newChat, name, userId, avatar },
			{ timeout: 15000 }
		);

		chatDispatch.sentChat({ ...chat });

		const { chats } = store.getState();

		chats.slice(0, chats.length - 8).forEach(({ id }) => deleteChat(id));
	} catch (error) {
		console.log("Chat error:", error.message);
		chatDispatch.failChat({ ...chat });
	}

	return;
};

const deleteChat = (id: string) => {
	return httpService
		.post(endpoints.deletecomment, { id })
		.then(() => chatDispatch.removeChat(id))
		.catch(e => console.log(e.message));
};

const chatService = { addChat, getChats, deleteChat };

export default chatService;
