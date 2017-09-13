SFD=$(wildcard *.sfd)
OTF=$(wildcard *.otf) $(SFD:.sfd=.otf)
TTF=$(wildcard *.ttf) $(OTF:.otf=.ttf)
WOFF=$(TTF:.ttf=.woff)
WOFF2=$(TTF:.ttf=.woff2)

webfonts : $(TTF) $(WOFF) $(WOFF2)

%.ttf : %.sfd
	fontforge -lang=ff -c 'Open($$1); Generate($$2)' "$<" "$@"

%.woff : %.ttf
	sfnt2woff "$<"

%.woff2 : %.ttf
	woff2_compress "$<"
