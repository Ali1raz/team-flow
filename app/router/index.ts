import { generateCompose, generateThreadSummary } from "./ai";
import {
  addMembersToChannel,
  createChannel,
  deleteChannel,
  getChannel,
  listChannelMembers,
  listChannels,
  removeMemberFromChannel,
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
import {
  createWorkspace,
  listWorkspaceMembers,
  listWorkspaces,
} from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    members: {
      invite: inviteMember,
      list: listWorkspaceMembers,
    },
  },
  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
    update: updateChannel,
    delete: deleteChannel,
    members: {
      list: listChannelMembers,
      add: addMembersToChannel,
      remove: removeMemberFromChannel,
    },
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
