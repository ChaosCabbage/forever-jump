define(function() {
    return function createJumpControl(bloke) {
        function preventEvent(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        }

        function doJump(evt) {
            bloke.jump();
            return preventEvent(evt);
        }

        function doJumpOnSpace(evt) {
            if (evt.keyCode == 32) {
                doJump(evt);
            }
        }

        return {
            enableJumping: function() {
                window.addEventListener("keydown", doJumpOnSpace, false);
                window.addEventListener("touchstart", doJump, false);

                window.addEventListener("click", preventEvent, false);
                window.addEventListener("touchend", preventEvent, false);
                window.addEventListener("touchmove", preventEvent, false);
                window.addEventListener("scroll", preventEvent, false);
            },
            disableJumping: function() {
                window.removeEventListener("keydown", doJumpOnSpace);
                window.removeEventListener("touchstart", doJump);

                window.removeEventListener("click", preventEvent);
                window.removeEventListener("touchend", preventEvent);
                window.removeEventListener("touchmove", preventEvent);
                window.removeEventListener("scroll", preventEvent);
            }
        };
    };
});
