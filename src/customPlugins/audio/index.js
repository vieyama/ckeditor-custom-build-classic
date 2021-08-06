import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileDialogButtonView from "@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview";
import Notification from "@ckeditor/ckeditor5-ui/src/notification/notification";
import axios from "axios";
import imageIcon from "./volume.svg";

export default class InsertAudio extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("insertAudio", (locale) => {
      const view = new FileDialogButtonView(locale);
      const notification = new Notification();

      view.set({
        acceptedType: "audio/*",
        allowMultipleFiles: false,
      });

      view.buttonView.set({
        label: "Insert Audio",
        icon: imageIcon,
        tooltip: true,
      });

      const uniqID = (
        Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      ).toUpperCase();
      notification.showInfo("Editor is offline.", {
        namespace: "editor:status",
      });
      notifications.on(
        "show:warning",
        (evt, data) => {
          console.log(data);
          // Log the warning to some error tracker.

          // Stop this event to prevent displaying it as an alert.
          evt.stop();
        },
        { priority: "low" }
      );
      view.on("done", async (evt, files) => {
        evt.stop();

        var file = files[0];

        const data = new FormData();
        data.append("bucketName", "media");
        data.append("storagePath", "question-file/audio");
        data.append("file", file);
        data.append("fileName", `question-audio-${uniqID}`);

        await axios
          .post(
            "https://dev-storageclient-edoo.mocogawe.com/uploadobject",
            data,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then((result) => {
            console.log(result);
            const audio = `<figure class="audio">
              <audio
                controls="controls"
                alt=""
                src="${result.data.urlPath}"
              >
                &nbsp;
              </audio>
            </figure>`;
            const viewFragment = editor.data.processor.toView(audio);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(
              modelFragment,
              editor.model.document.selection
            );
          });
      });
      return view;
    });
  }
}
