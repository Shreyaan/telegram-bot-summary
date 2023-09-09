const obj: ReplyMessage = {
  update_id: 660738805,

  message: {
    message_id: 283040,

    from: {
      id: 491597253,

      is_bot: false,

      first_name: "s..",

      username: "bruh7814",

      language_code: "en",
    },

    chat: {
      id: -1001177260793,

      title: "TRB Haterz 👻💀",

      type: "supergroup",
    },

    date: 1694113669,

    message_thread_id: 282997,

    reply_to_message: {
      message_id: 283039,

      from: {
        id: 491597253,

        is_bot: false,
        first_name: "s..",
        username: "bruh7814",

        language_code: "en",
      },

      chat: {
        id: -1001177260793,
        title: "TRB Haterz 👻💀",
        type: "supergroup",
      },

      date: 1694113652,

      message_thread_id: 282997,

      text: "Jokingly? Pichle 33 ghante se kuch nahi khaya 😞",
    },

    text: "sry darling",
  },
};

export type ReplyMessage = {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
      language_code: string;
    };
    chat: {
      id: number;
      title: string;
      type: string;
    };
    date: number;
    message_thread_id: number;
    reply_to_message: {
      message_id: number;
      from: {
        id: number;
        is_bot: boolean;
        first_name: string;
        username: string;
        language_code: string;
      };
      chat: {
        id: number;
        title: string;
        type: string;
      };
      date: number;
      message_thread_id: number;
      text: string;
    };
    text: string;
  };
};

//sticker
const obj2 = {
  update_id: 660738836,

  message: {
    message_id: 283076,

    from: {
      id: 491597253,

      is_bot: false,

      first_name: "s..",

      username: "bruh7814",

      language_code: "en",
    },

    chat: {
      id: -1001177260793,

      title: "TRB Haterz 👻💀",

      type: "supergroup",
    },

    date: 1694114126,

    sticker: {
      width: 512,

      height: 512,

      emoji: "🚶‍♂️",

      set_name: "Webp_14",

      is_animated: false,

      is_video: true,

      type: "regular",

      thumbnail: [Object],

      thumb: [Object],

      file_id:
        "CAACAgQAAx0CRiuS-QABBFHEZPohTkq3JNoDaSpmcj4fMDfv-IMAAuIOAAKV29lSkEMxHWzrOUkwBA",

      file_unique_id: "AgAD4g4AApXb2VI",

      file_size: 238633,
    },
  },
};
