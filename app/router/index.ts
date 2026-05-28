import { generateThreadSummary } from "./ai";
import { createChannel, getChannel, listChannels } from "./channel";
import { getInvitionDEtails } from "./invitations";
import { inviteMember } from "./members";
import {
  createMessage,
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
  },
  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
    threads: {
      list: listThreads,
    },
  },
  ai: {
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
