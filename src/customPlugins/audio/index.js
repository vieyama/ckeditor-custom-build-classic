import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

import imageIcon from "./volume.svg";

export default class InsertAudio extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("insertAudio", (locale) => {
      const view = new ButtonView(locale);

      view.set({
        label: "Insert audio",
        icon: imageIcon,
        tooltip: true,
      });

      // Callback executed once the image is clicked.
      view.on("execute", () => {
        const audioUrl = prompt("Audio URL");

        editor.model.change((writer) => {
          let audioElement = writer.createElement("AUDIO", {
            src: audioUrl,
          });
          console.log(audioElement);
          var x = document.createElement("AUDIO");

          if (x.canPlayType("audio/mpeg")) {
            x.setAttribute("src", audioUrl);
          } else {
            x.setAttribute("src", audioUrl);
          }

          x.setAttribute("controls", "controls");

          console.log(x);

          const audioFrame = `<figure class="audio"><audio controls="controls" alt="" src="${audioUrl}">&nbsp;</audio></figure><p>&nbsp;</p>`;
          // Insert the image in the current selection location.
          console.log(audioFrame);
          editor.execute("insertHtmlEmbed", audioFrame);
        });
      });

      return view;
    });
  }
}
