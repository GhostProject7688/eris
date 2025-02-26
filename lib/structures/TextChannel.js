"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Message = require("./Message");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
 * Represents a guild text channel. See GuildChannel for more properties and methods.
 * @extends GuildChannel
 * @prop {Number} defaultAutoArchiveDuration The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080)
 * @prop {String} lastMessageID The ID of the last message in this channel
 * @prop {Number} lastPinTimestamp The timestamp of the last pinned message
 * @prop {Collection<Message>} messages Collection of Messages in this channel
 * @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
 * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
 * @prop {Number} position The position of the channel
 * @prop {Number} rateLimitPerUser The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
 * @prop {String?} topic The topic of the channel
 */
class TextChannel extends GuildChannel {
    constructor(data, client, messageLimit) {
        super(data, client);
        this.messages = new Collection(Message, messageLimit == null ? client.options.messageLimit : messageLimit);
        this.lastMessageID = data.last_message_id || null;
        this.rateLimitPerUser = data.rate_limit_per_user == null ? null : data.rate_limit_per_user;
        this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.rate_limit_per_user !== undefined) {
            this.rateLimitPerUser = data.rate_limit_per_user;
        }
        if(data.topic !== undefined) {
            this.topic = data.topic;
        }
        if(data.default_auto_archive_duration !== undefined) {
            this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        }
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
        if(data.position !== undefined) {
            this.position = data.position;
        }
        if(data.nsfw !== undefined) {
            this.nsfw = data.nsfw;
        }
    }

    /**
     * Add a reaction to a message
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
     * @returns {Promise}
     */
    addMessageReaction(messageID, reaction, userID) {
        return this.client.addMessageReaction.call(this.client, this.id, messageID, reaction, userID);
    }

    /**
     * Create an invite for the channel
     * @arg {Object} [options] Invite generation options
     * @arg {Number} [options.maxAge] How long the invite should last in seconds
     * @arg {Number} [options.maxUses] How many uses the invite should last for
     * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
     * @arg {Boolean} [options.unique] Whether the invite is unique or not
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Invite>}
     */
    createInvite(options, reason) {
        return this.client.createChannelInvite.call(this.client, this.id, options, reason);
    }

    /**
     * Create a message in the channel
     * @arg {String | Object} content A string or object. If an object is passed:
     * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
     * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
     * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
     * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
     * @arg {Array<Object>} [content.attachments] An array of attachment objects with the filename and description
     * @arg {String} [content.attachments[].description] The description of the file
     * @arg {String} [content.attachments[].filename] The name of the file
     * @arg {Number} content.attachments[].id The index of the file
     * @arg {Array<Object>} [content.components] An array of component objects
     * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3 only)
     * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3 only)
     * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
     * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
     * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
     * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
     * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
     * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
     * @arg {String} [content.components[].options[].description] The description for this option
     * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
     * @arg {String} content.components[].options[].label The label for this option
     * @arg {Number | String} content.components[].options[].value The value for this option
     * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3 only)
     * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
     * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a select menu
     * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
     * @arg {String} [content.content] A content string
     * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Object} [content.messageReference] The message reference, used when replying to messages
     * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message
     * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
     * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
     * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
     * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
     * @arg {Array<String>} [content.stickerIDs] An array of IDs corresponding to stickers to send
     * @arg {Boolean} [content.tts] Set the message TTS flag
     * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
     * @arg {Buffer} file.file A buffer containing file data
     * @arg {String} file.name What to name the file
     * @returns {Promise<Message>}
     */
    createMessage(content, file) {
        return this.client.createMessage.call(this.client, this.id, content, file);
    }

    /**
     * Create a thread without an existing message
     * @arg {Object} options The thread options
     * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
     * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
     * @arg {String} options.name The thread channel name
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread)
     * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
     */
    createThread(options) {
        return this.client.createThread.call(this.client, this.id, options);
    }

    /**
     * Create a thread with an existing message
     * @arg {String} messageID The ID of the message to create the thread from
     * @arg {Object} options The thread options
     * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
     * @arg {String} options.name The thread channel name
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
     */
    createThreadWithMessage(messageID, options) {
        return this.client.createThreadWithMessage.call(this.client, this.id, messageID, options);
    }

    /**
     * [DEPRECATED] Create a thread without an existing message. Use `createThread` instead
     * @arg {Object} options The thread options
     * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
     * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
     * @arg {String} options.name The thread channel name
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread)
     * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
     */
    createThreadWithoutMessage(options) {
        return this.client.createThreadWithoutMessage.call(this.client, this.id, options);
    }

    /**
     * Create a channel webhook
     * @arg {Object} options Webhook options
     * @arg {String?} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
     * @arg {String} options.name The default name
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} Resolves with a webhook object
     */
    createWebhook(options, reason) {
        return this.client.createChannelWebhook.call(this.client, this.id, options, reason);
    }

    /**
     * Delete a message
     * @arg {String} messageID The ID of the message
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteMessage(messageID, reason) {
        return this.client.deleteMessage.call(this.client, this.id, messageID, reason);
    }

    /**
     * Bulk delete messages (bot accounts only)
     * @arg {Array<String>} messageIDs Array of message IDs to delete
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteMessages(messageIDs, reason) {
        return this.client.deleteMessages.call(this.client, this.id, messageIDs, reason);
    }

    /**
     * Edit a message
     * @arg {String} messageID The ID of the message
     * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
     * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
     * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
     * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
     * @arg {Array<Object>} [content.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
     * @arg {String} [content.attachments[].description] The description of the file
     * @arg {String} [content.attachments[].filename] The name of the file. This is not required if you are attaching a new file
     * @arg {Number | String} content.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
     * @arg {Array<Object>} [content.components] An array of component objects
     * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3 only)
     * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3 only)
     * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
     * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
     * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
     * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
     * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
     * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
     * @arg {String} [content.components[].options[].description] The description for this option
     * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
     * @arg {String} content.components[].options[].label The label for this option
     * @arg {Number | String} content.components[].options[].value The value for this option
     * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3 only)
     * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
     * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a select menu
     * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
     * @arg {String} [content.content] A content string
     * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
     * @arg {Buffer} content.file[].file A buffer containing file data
     * @arg {String} content.file[].name What to name the file
     * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
     * @returns {Promise<Message>}
     */
    editMessage(messageID, content) {
        return this.client.editMessage.call(this.client, this.id, messageID, content);
    }

    /**
     * Get all archived threads in this channel
     * @arg {String} type The type of thread channel, either "public" or "private"
     * @arg {Object} [options] Additional options when requesting archived threads
     * @arg {Date} [options.before] List of threads to return before the timestamp
     * @arg {Number} [options.limit] Maximum number of threads to return
     * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
     */
    getArchivedThreads(type, options) {
        return this.client.getArchivedThreads.call(this.client, this.id, type, options);
    }

    /**
     * Get all invites in the channel
     * @returns {Promise<Array<Invite>>}
     */
    getInvites() {
        return this.client.getChannelInvites.call(this.client, this.id);
    }

    /**
     * Get joined private archived threads in this channel
     * @arg {Object} [options] Additional options when requesting archived threads
     * @arg {Date} [options.before] List of threads to return before the timestamp
     * @arg {Number} [options.limit] Maximum number of threads to return
     * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
     */
    getJoinedPrivateArchivedThreads(options) {
        return this.client.getJoinedPrivateArchivedThreads.call(this.client, this.id, options);
    }

    /**
     * Get a previous message in the channel
     * @arg {String} messageID The ID of the message
     * @returns {Promise<Message>}
     */
    getMessage(messageID) {
        return this.client.getMessage.call(this.client, this.id, messageID);
    }

    /**
     * Get a list of users who reacted with a specific reaction
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
     * @arg {String} [options.after] Get users after this user ID
     * @arg {Number} [options.limit=100] The maximum number of users to get
     * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
     * @arg {String} [after] [DEPRECATED] Get users after this user ID
     * @returns {Promise<Array<User>>}
     */
    getMessageReaction(messageID, reaction, options, before, after) {
        return this.client.getMessageReaction.call(this.client, this.id, messageID, reaction, options, before, after);
    }

    /**
     * Get previous messages in the channel
     * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
     * @arg {String} [options.after] Get messages after this message ID
     * @arg {String} [options.around] Get messages around this message ID (does not work with limit > 100)
     * @arg {String} [options.before] Get messages before this message ID
     * @arg {Number} [options.limit=50] The max number of messages to get
     * @arg {String} [before] [DEPRECATED] Get messages before this message ID
     * @arg {String} [after] [DEPRECATED] Get messages after this message ID
     * @arg {String} [around] [DEPRECATED] Get messages around this message ID (does not work with limit > 100)
     * @returns {Promise<Array<Message>>}
     */
    getMessages(options, before, after, around) {
        return this.client.getMessages.call(this.client, this.id, options, before, after, around);
    }

    /**
     * Get all the pins in the channel
     * @returns {Promise<Array<Message>>}
     */
    getPins() {
        return this.client.getPins.call(this.client, this.id);
    }

    /**
     * Get all the webhooks in the channel
     * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
     */
    getWebhooks() {
        return this.client.getChannelWebhooks.call(this.client, this.id);
    }

    /**
     * Pin a message
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    pinMessage(messageID) {
        return this.client.pinMessage.call(this.client, this.id, messageID);
    }

    /**
     * Purge previous messages in the channel with an optional filter (bot accounts only)
     * @arg {Object} options Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
     * @arg {String} [options.after] Get messages after this message ID
     * @arg {String} [options.before] Get messages before this message ID
     * @arg {Function} [options.filter] Optional filter function that returns a boolean when passed a Message object
     * @arg {Number} options.limit The max number of messages to search through, -1 for no limit
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {Function} [filter] [DEPRECATED] Optional filter function that returns a boolean when passed a Message object
     * @arg {String} [before] [DEPRECATED] Get messages before this message ID
     * @arg {String} [after] [DEPRECATED] Get messages after this message ID
     * @arg {String} [reason] [DEPRECATED] The reason to be displayed in audit logs
     * @returns {Promise<Number>} Resolves with the number of messages deleted
     */
    purge(limit, filter, before, after, reason) {
        return this.client.purgeChannel.call(this.client, this.id, limit, filter, before, after, reason);
    }

    /**
     * Remove a reaction from a message
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
     * @returns {Promise}
     */
    removeMessageReaction(messageID, reaction, userID) {
        return this.client.removeMessageReaction.call(this.client, this.id, messageID, reaction, userID);
    }

    /**
     * Remove all reactions from a message for a single emoji
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @returns {Promise}
     */
    removeMessageReactionEmoji(messageID, reaction) {
        return this.client.removeMessageReactionEmoji.call(this.client, this.id, messageID, reaction);
    }

    /**
     * Remove all reactions from a message
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    removeMessageReactions(messageID) {
        return this.client.removeMessageReactions.call(this.client, this.id, messageID);
    }

    /**
     * Send typing status in the channel
     * @returns {Promise}
     */
    sendTyping() {
        return this.client.sendChannelTyping.call(this.client, this.id);
    }

    /**
     * Unpin a message
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    unpinMessage(messageID) {
        return this.client.unpinMessage.call(this.client, this.id, messageID);
    }

    /**
     * Un-send a message. You're welcome Programmix
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    unsendMessage(messageID) {
        return this.client.deleteMessage.call(this.client, this.id, messageID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "lastMessageID",
            "lastPinTimestamp",
            "messages",
            "nsfw",
            "permissionOverwrites",
            "position",
            "rateLimitPerUser",
            "topic",
            ...props
        ]);
    }
}

module.exports = TextChannel;
