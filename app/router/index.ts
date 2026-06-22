import { generateCompose, generateThreadSummary } from "./ai";
import {
  createChannel,
  getChannel,
  listChannels,
  updateChannel,
} from "./channel";
import { getInvitionDEtails } from "./invitations";
import { inviteMember } from "./members";
import {
  createMessage,
  deleteMessage,
  listMessages,
  listThreads,
  updateMessage,
} from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    members: {
      invite: inviteMember,
    },
  },
  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
    update: updateChannel,
  },
  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
    delete: deleteMessage,
    threads: {
      list: listThreads,
    },
  },
  ai: {
    compose: {
      generate: generateCompose,
    },
    threads: {
      summary: {
        generate: generateThreadSummary,
      },
    },
  },
  invitation: {
    get: getInvitionDEtails,
  },
};
